import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { handleFirebaseError } from './errorService';

const STORAGE_KEY_SETTINGS = 'wareflow_local_settings_v2';

function getLocalSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SETTINGS;
}

function setLocalSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {}
}

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    if (!db) return getLocalSettings();

    try {
      const snap = await getDoc(doc(db, 'settings', 'facility'));
      if (!snap.exists()) return getLocalSettings();
      const settings = snap.data() as AppSettings;
      setLocalSettings(settings);
      return settings;
    } catch (err) {
      handleFirebaseError(err, 'Settings Fetch');
      return getLocalSettings();
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    setLocalSettings(settings);

    if (db) {
      try {
        const settingsRef = doc(db, 'settings', 'facility');
        await setDoc(settingsRef, settings, { merge: true });
      } catch (err) {
        handleFirebaseError(err, 'Save Settings Cloud Sync');
      }
    }
  },

  async resetSettings(): Promise<void> {
    setLocalSettings(DEFAULT_SETTINGS);

    if (db) {
      try {
        const settingsRef = doc(db, 'settings', 'facility');
        await setDoc(settingsRef, DEFAULT_SETTINGS);
      } catch (err) {
        handleFirebaseError(err, 'Reset Settings Cloud Sync');
      }
    }
  },
};
