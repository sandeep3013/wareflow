import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('AIzaSyDemo')
  );
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isInitialized = false;
let initPromise: Promise<{ app: FirebaseApp | null; db: Firestore | null }> | null = null;

export const initFirebase = async () => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.info('[WAREFLOW Firebase] No Firebase credentials provided. Running in local in-memory fallback mode.');
        isInitialized = true;
        return { app: null, db: null };
      }

      // Initialize App Singleton
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

      // Initialize Firestore with multi-tab persistence
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch {
        db = getFirestore(app);
      }

      isInitialized = true;
      console.info('[WAREFLOW Firebase] Successfully initialized Firestore for project:', firebaseConfig.projectId);
      return { app, db };
    } catch (err) {
      console.warn('[WAREFLOW Firebase] Notice (using resilient local mode):', err);
      isInitialized = true;
      return { app: null, db: null };
    }
  })();

  return initPromise;
};

export { app, db, isInitialized };
