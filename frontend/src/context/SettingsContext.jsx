import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Per-browser voice/language/theme preferences. These are conveniences for this operator's browser,
// not business data, so localStorage is appropriate (with safe fallbacks when storage is blocked).
const KEY = 'vaaniq_settings_v1';
export const DEFAULT_SETTINGS = {
  language: 'en',
  autoSpeak: true,
  rate: 1,
  voices: { en: '', hi: '', te: '' },
  theme: 'dark',
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const s = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...s, voices: { ...DEFAULT_SETTINGS.voices, ...(s.voices || {}) } };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch, voices: { ...prev.voices, ...(patch.voices || {}) } };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage blocked: keep in memory for this session */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
