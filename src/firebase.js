import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBDI5KTyYJzmPrQTzLQWHKX4a_JNUzhot4",
  authDomain: "testing-vape.firebaseapp.com",
  projectId: "testing-vape",
  storageBucket: "testing-vape.firebasestorage.app",
  messagingSenderId: "995590793567",
  appId: "1:995590793567:web:eec0ae1b95926ac713eeea"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const app = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null

export const db = app ? getFirestore(app) : null
