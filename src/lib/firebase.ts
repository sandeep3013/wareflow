import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  Auth,
  User,
} from 'firebase/auth';

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
let auth: Auth | null = null;
let isInitialized = false;
let sessionPromise: Promise<User | null> | null = null;

export const initFirebase = async () => {
  if (app && db && auth) {
    return { app, db, auth };
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.info('[WAREFLOW Firebase] No Firebase credentials provided. Running in local in-memory fallback mode.');
    isInitialized = true;
    return { app: null, db: null, auth: null };
  }

  try {
    // 1. Initialize App Singleton
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

    // 2. Initialize Firestore with multi-tab persistence
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      db = getFirestore(app);
    }

    // 3. Initialize Firebase Auth
    auth = getAuth(app);
    isInitialized = true;
    console.info('[WAREFLOW Firebase] Successfully initialized Firestore for project:', firebaseConfig.projectId);
    return { app, db, auth };
  } catch (err) {
    console.warn('[WAREFLOW Firebase] Notice (using resilient local mode):', err);
    isInitialized = true;
    return { app: null, db: null, auth: null };
  }
};

/**
 * Ensures a silent, anonymous authenticated Firebase session exists.
 * Resolves with the authenticated User object (or null in offline/mock mode).
 */
export const ensureFirebaseSession = async (): Promise<User | null> => {
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    try {
      const { auth: firebaseAuth } = await initFirebase();
      if (!firebaseAuth) {
        return null;
      }

      // If user already exists in current session, return immediately
      if (firebaseAuth.currentUser) {
        return firebaseAuth.currentUser;
      }

      // Wait for existing auth state listener or sign in anonymously silently
      const user = await new Promise<User | null>((resolve) => {
        let isResolved = false;
        let unsubscribe: (() => void) | null = null;

        const timer = setTimeout(async () => {
          if (isResolved) return;
          if (unsubscribe) unsubscribe();
          try {
            const cred = await signInAnonymously(firebaseAuth);
            isResolved = true;
            resolve(cred.user);
          } catch (err) {
            console.error('[WAREFLOW Firebase] Anonymous sign-in timeout fallback failed:', err);
            isResolved = true;
            resolve(null);
          }
        }, 3500);

        unsubscribe = onAuthStateChanged(
          firebaseAuth,
          async (currentUser) => {
            if (isResolved) return;
            if (currentUser) {
              clearTimeout(timer);
              isResolved = true;
              if (unsubscribe) unsubscribe();
              resolve(currentUser);
            } else {
              try {
                const cred = await signInAnonymously(firebaseAuth);
                clearTimeout(timer);
                isResolved = true;
                if (unsubscribe) unsubscribe();
                resolve(cred.user);
              } catch (err) {
                clearTimeout(timer);
                isResolved = true;
                if (unsubscribe) unsubscribe();
                console.error('[WAREFLOW Firebase] Silent anonymous authentication failed:', err);
                resolve(null);
              }
            }
          },
          (err) => {
            clearTimeout(timer);
            if (isResolved) return;
            isResolved = true;
            if (unsubscribe) unsubscribe();
            console.error('[WAREFLOW Firebase] Auth state observer error:', err);
            resolve(null);
          }
        );
      });

      return user;
    } catch (err) {
      console.error('[WAREFLOW Firebase] Session creation error:', err);
      return null;
    }
  })();

  return sessionPromise;
};

export const resetFirebaseSession = async (): Promise<void> => {
  sessionPromise = null;
  if (auth && auth.currentUser) {
    try {
      await auth.signOut();
    } catch {
      // ignore
    }
  }
  await ensureFirebaseSession();
};

export { app, db, auth, isInitialized };

