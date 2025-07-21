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
    // Update UI immediately
    setColorSchemeState(scheme);
    
    // Save to storage in background
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, scheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    // Update UI immediately for instant response
    setColorSchemeState(newScheme);
    
    // Save to storage in background
    AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newScheme).catch((error) => {
      console.error('Error saving theme:', error);
    });
  };

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
