// App configuration constants
export const APP_CONFIG = {
  name: 'Karzdaar',
  version: '1.0.0',
} as const;

// API configuration
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.karzdaar.com',
  timeout: 10000,
} as const;

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  USER_TOKEN: '@karzdaar:userToken',
  USER_DATA: '@karzdaar:userData',
  THEME_MODE: '@karzdaar:themeMode',
  ONBOARDING_COMPLETED: '@karzdaar:onboardingCompleted',
} as const;

// Screen names (useful for navigation)
export const SCREEN_NAMES = {
  HOME: 'Home',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  LOGIN: 'Login',
  REGISTER: 'Register',
} as const;

// Export Colors
export { Colors } from './Colors';
