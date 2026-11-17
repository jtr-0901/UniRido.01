/**
 * Firebase Integration Stubs for UniRido Pilot
 *
 * Currently running in offline-first Pilot Mode backed by localStorage (`dataService.ts`).
 * When moving from frontend prototype to live REVA University pilot:
 * 1. Install `firebase` (`npm install firebase`)
 * 2. Populate `VITE_FIREBASE_*` keys in `.env`
 * 3. Replace the mock handlers in `src/services/dataService.ts` with the Firestore/Auth calls below.
 */

export const IS_FIREBASE_ENABLED = false;

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const FIREBASE_COLLECTIONS = {
  users: 'users',
  routes: 'routes',
  rides: 'rides',
  waitlist: 'waitlist',
  reports: 'safety_reports',
} as const;

// TODO: Initialize Firebase App, Auth, Firestore, and Storage when IS_FIREBASE_ENABLED is true.
// Example:
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';
// export const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

export function getFirebaseConnectionStatus(): 'mock-local' | 'live' {
  return IS_FIREBASE_ENABLED && Boolean(firebaseConfig.apiKey)
    ? 'live'
    : 'mock-local';
}
