import { storageKeys } from '@/services/storage/keys';
import { preferenceStorage } from '@/services/storage/preference-storage';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setPreference: (theme: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const systemTheme = colorScheme === 'dark' ? 'dark' : 'light';
  const [preference, setPreferenceState] =
    useState<ThemePreference>('system');

  useEffect(() => {
    preferenceStorage.get(storageKeys.theme).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = async (theme: ThemePreference) => {
    await preferenceStorage.set(storageKeys.theme, theme);
    setPreferenceState(theme);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolvedTheme: preference === 'system' ? systemTheme : preference,
      setPreference,
    }),
    [preference, systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used within AppThemeProvider');
  return value;
}
