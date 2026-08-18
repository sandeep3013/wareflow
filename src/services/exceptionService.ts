import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationalException } from '../types/exception';
import { handleFirebaseError, AppError } from './errorService';
import { MOCK_EXCEPTIONS } from '../data/exceptions';

const STORAGE_KEY_EXCEPTIONS = 'wareflow_local_exceptions_v2';

function getLocalExceptions(): OperationalException[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXCEPTIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_EXCEPTIONS;
}

function setLocalExceptions(exceptions: OperationalException[]) {
  try {
    localStorage.setItem(STORAGE_KEY_EXCEPTIONS, JSON.stringify(exceptions));
  } catch {}
}

export const exceptionService = {
  async getExceptions(): Promise<OperationalException[]> {
    if (!db) return getLocalExceptions();

    try {
      const snap = await getDocs(collection(db, 'exceptions'));
      if (snap.empty) return getLocalExceptions();
      const exceptions = snap.docs.map((d) => d.data() as OperationalException);
      setLocalExceptions(exceptions);
      return exceptions;
    } catch (err) {
      handleFirebaseError(err, 'Exceptions Fetch');
      return getLocalExceptions();
    }
  },

  subscribeExceptions(
    onData: (exceptions: OperationalException[]) => void,
    onError?: (error: AppError) => void
  ): Unsubscribe {
    if (!db) {
      onData(getLocalExceptions());
      return () => {};
    }

    try {
      const q = query(collection(db, 'exceptions'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const exceptions = snapshot.docs.map((d) => d.data() as OperationalException);
            setLocalExceptions(exceptions);
            onData(exceptions);
          }
        },
        (err) => {
          const appErr = handleFirebaseError(err, 'Exceptions Stream');
          if (onError) onError(appErr);
          onData(getLocalExceptions());
        }
      );
    } catch {
      onData(getLocalExceptions());
      return () => {};
    }
  },

  async createException(exception: OperationalException): Promise<void> {
    const current = getLocalExceptions();
    setLocalExceptions([exception, ...current.filter((e) => e.id !== exception.id)]);

    if (db) {
      try {
        const excRef = doc(db, 'exceptions', exception.id);
        await setDoc(excRef, exception);
      } catch (err) {
        handleFirebaseError(err, 'Create Exception Cloud Sync');
      }
    }
  },

  async resolveException(
    exceptionId: string,
    resolutionId: string,
    resolutionNotes?: string
  ): Promise<void> {
    const current = getLocalExceptions();
    const now = new Date().toISOString();

    const updated = current.map((exc) => {
      if (exc.id === exceptionId) {
        return {
          ...exc,
          status: 'RESOLVED' as const,
          selectedResolutionId: resolutionId,
          resolvedAt: now,
          resolvedBy: 'Marcus Vance (Ops Manager)',
          resolutionNotes: resolutionNotes || 'Autonomous resolution approved & executed by operator.',
        };
      }
      return exc;
    });
    setLocalExceptions(updated);

    if (db) {
      try {
        const excRef = doc(db, 'exceptions', exceptionId);
        await updateDoc(excRef, {
          status: 'RESOLVED',
          selectedResolutionId: resolutionId,
          resolvedAt: now,
          resolvedBy: 'Marcus Vance (Ops Manager)',
          resolutionNotes: resolutionNotes || 'Autonomous resolution approved & executed by operator.',
        });
      } catch (err) {
        handleFirebaseError(err, 'Resolve Exception Cloud Sync');
      }
    }
  },

  async resetExceptions(): Promise<void> {
    setLocalExceptions(MOCK_EXCEPTIONS);

    if (db) {
      try {
        const batch = writeBatch(db);
        MOCK_EXCEPTIONS.forEach((exception) => {
          const excDoc = doc(db!, 'exceptions', exception.id);
          batch.set(excDoc, exception, { merge: true });
        });
        await batch.commit();
      } catch (err) {
        handleFirebaseError(err, 'Reset Exceptions Cloud Sync');
      }
    }
  },
};
