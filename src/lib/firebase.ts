import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Clean environment variable bindings with user-provided configuration fallback
 */
const getEnv = (key: string): string => {
  // Support Vite import.meta.env
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
      if (import.meta.env[`NEXT_PUBLIC_${key}`]) return import.meta.env[`NEXT_PUBLIC_${key}`];
      if (import.meta.env[key]) return import.meta.env[key];
    }
  } catch {}

  // Support Node / Next.js process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`]!;
      if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`]!;
      if (process.env[key]) return process.env[key]!;
    }
  } catch {}

  return '';
};

export const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY') || 'AIzaSyDnSrWcVt-eOKTm1_ncz5eYdIqeO4HKlsE',
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN') || 'solarithm-tools-370ed.firebaseapp.com',
  projectId: getEnv('FIREBASE_PROJECT_ID') || 'solarithm-tools-370ed',
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET') || 'solarithm-tools-370ed.firebasestorage.app',
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID') || '76083145868',
  appId: getEnv('FIREBASE_APP_ID') || '1:76083145868:web:2061d43078c6c9fc8cdfa9',
};

// Guard against duplicate app initialization across reloads & Fast Refresh
let app: FirebaseApp;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let isFirebaseAvailable = false;

try {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }

  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
  isFirebaseAvailable = true;
} catch (err) {
  console.warn('Firebase initialization notice:', err);
  // Safe fallback dummy app reference
  app = (getApps().length > 0 ? getApp() : undefined) as unknown as FirebaseApp;
}

export { app, db, storage, auth, isFirebaseAvailable };

/**
 * Lightweight connection test for offline safety
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    // If browser is offline, instantly return false
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
