import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

export async function loadProducts() {
  if (!isFirebaseConfigured || !db) {
    return { loaded: false, reason: 'missing-config', products: [] }
  }

  const productsQuery = query(collection(db, 'products'), orderBy('sortOrder'))
  const snapshot = await getDocs(productsQuery)
  const products = snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...productDoc.data(),
  }))

  return { loaded: true, products }
}

export async function saveProduct(product) {
  if (!isFirebaseConfigured || !db) {
    return { saved: false, reason: 'missing-config' }
  }

  const productRef = doc(db, 'products', product.id)

  await setDoc(
    productRef,
    {
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  return { saved: true }
}
