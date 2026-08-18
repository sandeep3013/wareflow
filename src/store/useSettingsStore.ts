import { create } from 'zustand';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { settingsService } from '../services/settingsService';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  // Actions
  initSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  initSettings: async () => {
    try {
      const saved = await settingsService.getSettings();
      set({ settings: saved });
    } catch (err) {
      console.warn('[WAREFLOW Settings Store] Load notice:', err);
    }
  },

  updateSetting: async (key, value) => {
    const updated = { ...get().settings, [key]: value };
    set({ settings: updated });
    await settingsService.saveSettings(updated);
  },

  updateSettings: async (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    await settingsService.saveSettings(updated);
  },

  resetToDefaults: async () => {
    set({ settings: DEFAULT_SETTINGS });
    await settingsService.resetSettings();
  },
}));
