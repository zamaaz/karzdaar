import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { STORAGE_KEYS } from '@/src/constants';

export type ColorSchemeName = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  setColorScheme: (scheme: ColorSchemeName) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useNativeColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorSchemeName>(
    systemColorScheme || 'light'
  );
  const [isThemeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
        if (storedTheme) {
          setColorSchemeState(storedTheme as ColorSchemeName);
        }
      } catch (error) {
        console.error('Error loading stored theme:', error);
      } finally {
        setThemeLoaded(true);
      }
    };

    loadStoredTheme();
  }, []);

  const setColorScheme = async (scheme: ColorSchemeName) => {
    setColorSchemeState(scheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, scheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme); // Reuse the setColorScheme function
  };
  
  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useColorScheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ThemeProvider');
  }
  return context;
}
