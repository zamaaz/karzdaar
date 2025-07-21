import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform, AppState } from 'react-native';

export interface BiometricContextType {
  isLocked: boolean;
  isBiometricEnabled: boolean;
  isBiometricSupported: boolean;
  isAuthenticating: boolean;
  toggleBiometricLock: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  lockApp: () => void;
  unlockApp: () => void;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

const BIOMETRIC_LOCK_KEY = 'biometric_lock_enabled';
const APP_LOCKED_KEY = 'app_is_locked';

interface BiometricProviderProps {
  children: ReactNode;
}

export function BiometricProvider({ children }: BiometricProviderProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check biometric support and load settings on app start
  useEffect(() => {
    initializeBiometric();
  }, []);

  // Handle app state changes for auto-locking
  useEffect(() => {
    if (Platform.OS === 'web') return; // Skip for web

    const handleAppStateChange = (nextAppState: string) => {
      if (isBiometricEnabled) {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App is going to background - lock it
          lockApp();
        }
        // When app becomes active, the lock screen will handle authentication
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isBiometricEnabled]);

  const initializeBiometric = async () => {
    try {
      // Check if device supports biometric authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportsBiometric = hasHardware && isEnrolled;
      
      setIsBiometricSupported(supportsBiometric);

      if (supportsBiometric) {
        // Load biometric lock setting
        const biometricEnabledStr = await AsyncStorage.getItem(BIOMETRIC_LOCK_KEY);
        const biometricEnabled = biometricEnabledStr === 'true';
        setIsBiometricEnabled(biometricEnabled);

        // If biometric is enabled, check if app should be locked
        if (biometricEnabled) {
          const appLockedStr = await AsyncStorage.getItem(APP_LOCKED_KEY);
          const appLocked = appLockedStr !== 'false'; // Default to locked if not set
          setIsLocked(appLocked);
        }
      }
    } catch (error) {
      console.error('Error initializing biometric:', error);
      setIsBiometricSupported(false);
    }
  };

  const toggleBiometricLock = async (): Promise<void> => {
    try {
      if (!isBiometricSupported) {
        console.log('Biometric not supported: Biometric authentication is not available on this device');
        return;
      }

      if (!isBiometricEnabled) {
        // Enabling biometric lock - require authentication first
        const authResult = await authenticateWithBiometric();
        if (authResult) {
          setIsBiometricEnabled(true);
          await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, 'true');
          console.log('Success: Biometric lock has been enabled');
        }
      } else {
        // Disabling biometric lock
        setIsBiometricEnabled(false);
        setIsLocked(false);
        await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, 'false');
        await AsyncStorage.setItem(APP_LOCKED_KEY, 'false');
        console.log('Success: Biometric lock has been disabled');
      }
    } catch (error) {
      console.error('Error toggling biometric lock:', error);
      console.log('Error: Failed to update biometric lock settings');
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      if (!isBiometricSupported) {
        return true; // Skip authentication if not supported
      }

      setIsAuthenticating(true);

      // Get available authentication types
      const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let promptMessage = 'Authenticate to access Karzdaar';
      
      if (authTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        promptMessage = 'Use Face ID to unlock Karzdaar';
      } else if (authTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        promptMessage = 'Use your fingerprint to unlock Karzdaar';
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        return true;
      } else {
        // Handle different error types without showing alerts
        console.log('Authentication result:', authResult);
        
        if (authResult.error === 'user_cancel') {
          console.log('User cancelled authentication');
        } else if (authResult.error === 'user_fallback') {
          console.log('User chose fallback method');
        } else if (authResult.error === 'lockout') {
          console.log('Too many failed attempts - device locked');
        } else if (authResult.error === 'not_enrolled') {
          console.log('No biometric data enrolled');
        } else {
          console.log('Other authentication error:', authResult.error);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      // Don't show alert here - let the UI handle error display
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const lockApp = async () => {
    setIsLocked(true);
    await AsyncStorage.setItem(APP_LOCKED_KEY, 'true');
  };

  const unlockApp = async () => {
    setIsLocked(false);
    await AsyncStorage.setItem(APP_LOCKED_KEY, 'false');
  };

  const value: BiometricContextType = {
    isLocked,
    isBiometricEnabled,
    isBiometricSupported,
    isAuthenticating,
    toggleBiometricLock,
    authenticateWithBiometric,
    lockApp,
    unlockApp,
  };

  return (
    <BiometricContext.Provider value={value}>
      {children}
    </BiometricContext.Provider>
  );
}

export const useBiometric = (): BiometricContextType => {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within a BiometricProvider');
  }
  return context;
};
