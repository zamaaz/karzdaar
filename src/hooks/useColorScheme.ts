import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/constants';

export type ColorSchemeName = 'light' | 'dark';

export function useColorScheme(): {
  colorScheme: ColorSchemeName;
  setColorScheme: (scheme: ColorSchemeName) => void;
  toggleColorScheme: () => void;
} {
  const systemColorScheme = useNativeColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorSchemeName>(
    systemColorScheme || 'light'
  );

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (storedTheme) {
        setColorSchemeState(storedTheme as ColorSchemeName);
      }
    } catch (error) {
      console.error('Error loading stored theme:', error);
    }
  };

  const setColorScheme = async (scheme: ColorSchemeName) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
  };

  return {
    colorScheme,
    setColorScheme,
    toggleColorScheme,
  };
}
