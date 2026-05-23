import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { saveCartItem } from './services/cartService'
import { loadProducts, saveProduct } from './services/productService'

const adminPasscode = import.meta.env.VITE_ADMIN_PASSCODE || '1234'

const defaultProducts = [
  {
    id: 'elfbar-raya-d1',
    sortOrder: 1,
    name: 'ELFBAR Raya D1',
    category: 'Disposable',
    price: 18,
    stock: 12,
    inStock: true,
    image: 'https://vapeshopjb.com/cdn/shop/files/elfbar-raya-d1-13k-puff-lychee-juicy-peach-vape-shop-eco-botanic.jpg?v=1732198252&width=1445',
    note: 'Blueberry Ice',
    description:
      'A compact disposable vape with smooth draw activation, pocket-ready shape, and a crisp fruit-ice flavour profile.',
    flavours: ['Blueberry Ice', 'Mango Chill', 'Grape Frost'],
  },
  {
    id: 'elfbar-raya-s1',
    sortOrder: 2,
    name: 'ELFBAR Raya S1',
    category: 'Rechargeable',
    price: 24,
    stock: 8,
    inStock: true,
    image: 'https://vapemonkeyofficial.com/wp-content/uploads/2026/02/s1-raya.jpg',
    note: 'Strawberry Kiwi',
    description:
      'A rechargeable vape with a clean mouthpiece, steady vapour output, and bright fruit blends for everyday sessions.',
    flavours: ['Strawberry Kiwi', 'Peach Mint', 'Watermelon Ice'],
  },
  {
    id: 'mistpod-pro',
    sortOrder: 3,
    name: 'MistPod Pro',
    category: 'Pod Kit',
    price: 36,
    stock: 5,
    inStock: true,
    image: '/product-lamp.svg',
    note: 'Vanilla Mint',
    description:
      'A refillable pod kit with a soft-touch body, simple airflow, and flavour-forward pods for a tidy carry setup.',
    flavours: ['Vanilla Mint', 'Cool Tobacco', 'Lychee Splash'],
  },
  {
    id: 'frostpen-mini',
    sortOrder: 4,
    name: 'FrostPen Mini',
    category: 'Starter',
    price: 16,
    stock: 0,
    inStock: false,
    image: '/product-bottle.svg',
    note: 'Lemon Soda',
    description:
      'A slim starter vape with a light hand feel, easy draw, and bright soda-inspired flavours for quick use on the go.',
    flavours: ['Lemon Soda', 'Apple Ice', 'Cola Freeze'],
  },
]

function App() {
  const [products, setProducts] = useState(defaultProducts)
  const [cart, setCart] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(defaultProducts[0])
  const [selectedFlavour, setSelectedFlavour] = useState(defaultProducts[0].flavours[0])
  const [quantity, setQuantity] = useState(1)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [route, setRoute] = useState(() =>
    window.location.hash === '#admin' ? 'admin' : 'store',
  )
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [editingProductId, setEditingProductId] = useState(defaultProducts[0].id)
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false)

  const featuredTotal = useMemo(
    () => products.reduce((sum, product) => sum + product.price, 0),
    [products],
  )

  const editingProduct =
    products.find((product) => product.id === editingProductId) ?? products[0]

  useEffect(() => {
    function syncRoute() {
      setRoute(window.location.hash === '#admin' ? 'admin' : 'store')
    }

    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    async function syncProducts() {
      const result = await loadProducts()

      if (result.loaded && result.products.length > 0) {
        setProducts(result.products)
        setSelectedProduct(result.products[0])
        setSelectedFlavour(result.products[0].flavours[0])
        setEditingProductId(result.products[0].id)
      }
    }

    syncProducts()
  }, [])

  function chooseProduct(product) {
    setSelectedProduct(product)
    setSelectedFlavour(product.flavours[0])
    setQuantity(1)
    setSaveStatus('')
  }

  async function addSelectionToCart() {
    if (!selectedProduct.inStock || selectedProduct.stock <= 0) {
      setSaveStatus('This product is currently out of stock.')
      return
    }

    setIsSaving(true)
    setSaveStatus('')

    try {
      const result = await saveCartItem({
        product: selectedProduct,
        flavour: selectedFlavour,
        quantity,
      })

      setCart((count) => count + quantity)
      setSaveStatus(
        result.saved
          ? 'Saved to Firebase.'
          : 'Added locally. Add Firebase env values to save online.',
      )
    } catch {
      setSaveStatus('Could not save to Firebase. Please check your Firebase setup.')
    } finally {
      setIsSaving(false)
    }
  }

  function openProductDetail(product) {
    chooseProduct(product)
    setIsDetailOpen(true)
  }

  function unlockAdmin(event) {
    event.preventDefault()

    if (adminPasscodeInput !== adminPasscode) {
      setAdminMessage('Wrong passcode.')
      return
    }

    setIsAdminUnlocked(true)
    setAdminPasscodeInput('')
  }

  function updateEditingProduct(field, value) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              [field]: value,
            }
          : product,
      ),
    )
  }

  function updateEditingFlavours(value) {
    updateEditingProduct(
      'flavours',
      value
        .split(',')
        .map((flavour) => flavour.trim())
        .filter(Boolean),
    )
  }

  async function saveEditingProduct(event) {
    event.preventDefault()
    setIsLoadingAdmin(true)
    setAdminMessage('')

    try {
      const result = await saveProduct(editingProduct)
      setAdminMessage(
        result.saved
          ? 'Product saved.'
          : 'Updated locally. Add Firebase env values to save online.',
      )
      if (selectedProduct.id === editingProduct.id) {
        setSelectedProduct(editingProduct)
      }
    } catch {
      setAdminMessage('Could not save product. Check Firebase rules and setup.')
    } finally {
      setIsLoadingAdmin(false)
    }
  }

  if (route === 'admin') {
    return (
      <div className="storefront">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Mist Market home">
            Mist Market
          </a>
          <nav className="main-nav" aria-label="Admin navigation">
            <a href="#top">Storefront</a>
          </nav>
          <button className="cart-button" type="button">
            Admin
          </button>
        </header>

        <main className="admin-page">
          <section className="admin-shell" aria-label="Product admin">
            <div className="admin-header">
              <div>
                <p className="eyebrow">Admin</p>
                <h1>Product editor</h1>
              </div>
              <a className="secondary-action" href="#top">
                Back to shop
              </a>
            </div>

            {!isAdminUnlocked ? (
              <form className="admin-login" onSubmit={unlockAdmin}>
                <label htmlFor="admin-passcode">Passcode</label>
                <input
                  id="admin-passcode"
                  type="password"
                  value={adminPasscodeInput}
                  onChange={(event) => setAdminPasscodeInput(event.target.value)}
                  placeholder="Enter passcode"
                />
                <button type="submit">Unlock</button>
                {adminMessage && <p>{adminMessage}</p>}
              </form>
            ) : (
              <div className="product-admin-layout">
                <aside className="admin-product-list" aria-label="Products">
                  {products.map((product) => (
                    <button
                      className={product.id === editingProduct.id ? 'active' : ''}
                      type="button"
                      key={product.id}
                      onClick={() => setEditingProductId(product.id)}
                    >
                      <span>{product.name}</span>
                      <strong>{product.inStock && product.stock > 0 ? 'In stock' : 'Out'}</strong>
                    </button>
                  ))}
                </aside>

                <form className="product-editor" onSubmit={saveEditingProduct}>
                  <div className="editor-grid">
                    <label>
                      Product name
                      <input
                        value={editingProduct.name}
                        onChange={(event) => updateEditingProduct('name', event.target.value)}
                      />
                    </label>
                    <label>
                      Category
                      <input
                        value={editingProduct.category}
                        onChange={(event) => updateEditingProduct('category', event.target.value)}
                      />
                    </label>
                    <label>
                      Price
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.price}
                        onChange={(event) =>
                          updateEditingProduct('price', Number(event.target.value))
                        }
                      />
                    </label>
                    <label>
                      Stock
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.stock}
                        onChange={(event) =>
                          updateEditingProduct('stock', Number(event.target.value))
                        }
                      />
                    </label>
                    <label className="editor-wide">
                      Image URL
                      <input
                        value={editingProduct.image}
                        onChange={(event) => updateEditingProduct('image', event.target.value)}
                      />
                    </label>
                    <label>
                      Featured flavour
                      <input
                        value={editingProduct.note}
                        onChange={(event) => updateEditingProduct('note', event.target.value)}
                      />
                    </label>
                    <label>
                      Flavours
                      <input
                        value={editingProduct.flavours.join(', ')}
                        onChange={(event) => updateEditingFlavours(event.target.value)}
                      />
                    </label>
                    <label className="editor-wide">
                      Description
                      <textarea
                        value={editingProduct.description}
                        onChange={(event) =>
                          updateEditingProduct('description', event.target.value)
                        }
                      />
                    </label>
                    <label className="stock-toggle">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock}
                        onChange={(event) =>
                          updateEditingProduct('inStock', event.target.checked)
                        }
                      />
                      Available for sale
                    </label>
                  </div>

                  <div className="editor-actions">
                    <button type="submit" disabled={isLoadingAdmin}>
                      {isLoadingAdmin ? 'Saving...' : 'Save product'}
                    </button>
                    {adminMessage && <p className="admin-message">{adminMessage}</p>}
                  </div>
                </form>
              </div>
            )}
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="storefront">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Mist Market home">
          Mist Market
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
          <a href="#admin">Admin</a>
        </nav>
        <button className="cart-button" type="button">
          Cart <span>{cart}</span>
        </button>
      </header>

      <main id="top">
        {isDetailOpen && (
          <div className="detail-popup" role="dialog" aria-modal="true">
            <button
              className="popup-backdrop"
              type="button"
              aria-label="Close product detail"
              onClick={() => setIsDetailOpen(false)}
            ></button>
            <section className="product-detail popup-card" aria-label="Product detail">
              <div className="detail-media">
                <img src={selectedProduct.image} alt="" />
              </div>
              <div className="detail-card">
                <button
                  className="close-button"
                  type="button"
                  aria-label="Close product detail"
                  onClick={() => setIsDetailOpen(false)}
                >
                  X
                </button>
                <p className="eyebrow">{selectedProduct.category}</p>
                <div className="detail-title">
                  <h2>{selectedProduct.name}</h2>
                  <strong>${selectedProduct.price}</strong>
                </div>
                <p>{selectedProduct.description}</p>
                <p className={selectedProduct.inStock ? 'stock-status' : 'stock-status out'}>
                  {selectedProduct.inStock && selectedProduct.stock > 0
                    ? `${selectedProduct.stock} available`
                    : 'Out of stock'}
                </p>

                <label className="chooser-group flavour-field" htmlFor="flavour-choice">
                  <span>Flavour</span>
                  <select
                    id="flavour-choice"
                    value={selectedFlavour}
                    onChange={(event) => setSelectedFlavour(event.target.value)}
                  >
                    {selectedProduct.flavours.map((flavour) => (
                      <option key={flavour} value={flavour}>
                        {flavour}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="purchase-row">
                  <div className="quantity-control" aria-label="Choose quantity">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(9, value + 1))}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="detail-add"
                    type="button"
                    onClick={addSelectionToCart}
                    disabled={isSaving || !selectedProduct.inStock || selectedProduct.stock <= 0}
                  >
                    {isSaving ? 'Saving...' : `Add ${quantity} to cart`}
                  </button>
                </div>
                <p className="selection-summary">
                  Selected: {selectedProduct.name} in {selectedFlavour}
                </p>
                {saveStatus && <p className="save-status">{saveStatus}</p>}
              </div>
            </section>
          </div>
        )}

        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Flavour drop</p>
            <h1 id="hero-title">Creamy, clean vape shop for flavour browsing.</h1>
            <p>
              Browse disposable vapes, starter pens, and pod kits with fresh
              fruit, mint, soda, and classic flavours.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#shop">
                Shop collection
              </a>
              <a className="secondary-action" href="#categories">
                Browse categories
              </a>
            </div>
          </div>
          <div className="hero-product" aria-label="Featured vape bundle">
            <img src="/product-tote.svg" alt="CloudBar Max vape" />
            <img src="/product-cup.svg" alt="Nova Puff 8K vape" />
            <div>
              <span>Featured bundle</span>
              <strong>${featuredTotal}</strong>
            </div>
          </div>
        </section>

        <section className="category-strip" id="categories" aria-label="Categories">
          <a href="#shop">New arrivals</a>
          <a href="#shop">Disposables</a>
          <a href="#shop">Pod kits</a>
          <a href="#shop">Starter pens</a>
        </section>

        <section className="products-section" id="shop" aria-labelledby="shop-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured products</p>
              <h2 id="shop-title">Fresh picks</h2>
            </div>
            <a href="#shop">View all</a>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article
                className={`product-card${
                  product.id === selectedProduct.id ? ' selected' : ''
                }`}
                key={product.name}
                role="button"
                tabIndex={0}
                onClick={() => openProductDetail(product)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openProductDetail(product)
                  }
                }}
              >
                <div className="product-image">
                  <img src={product.image} alt="" />
                </div>
                <div className="product-info">
                  <div>
                    <p>{product.category}</p>
                    <h3>{product.name}</h3>
                    <span>{product.note}</span>
                  </div>
                  <strong>${product.price}</strong>
                </div>
                <span className={product.inStock && product.stock > 0 ? 'stock-pill' : 'stock-pill out'}>
                  {product.inStock && product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                </span>
                <button type="button">
                  View details
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer" id="about">
        <div>
          <h2>Mist Market</h2>
          <p>Vape products are intended for adults only. Check your local rules before purchasing.</p>
        </div>
        <nav aria-label="Footer">
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#top">Back to top</a>
        </nav>
      </footer>
    </div>
  )
}

export default App
