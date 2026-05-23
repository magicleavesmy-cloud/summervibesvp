import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

export async function saveCartItem({ product, flavour, quantity }) {
  if (!isFirebaseConfigured || !db) {
    return { saved: false, reason: 'missing-config' }
  }

  const cartItem = {
    productName: product.name,
    category: product.category,
    flavour,
    quantity,
    unitPrice: product.price,
    subtotal: product.price * quantity,
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, 'cartItems'), cartItem)

  return { saved: true, id: docRef.id }
}

export async function loadCartItems() {
  if (!isFirebaseConfigured || !db) {
    return { loaded: false, reason: 'missing-config', items: [] }
  }

  const cartQuery = query(
    collection(db, 'cartItems'),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  const snapshot = await getDocs(cartQuery)
  const items = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  return { loaded: true, items }
}
