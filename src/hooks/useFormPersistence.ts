import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { useBiometric } from '@/src/store';

interface FormPersistenceOptions {
  formId: string;
  formData: any;
  enabled?: boolean;
}

const FORM_DATA_PREFIX = 'form_data_';

export function useFormPersistence({ formId, formData, enabled = true }: FormPersistenceOptions) {
  const { isBiometricEnabled } = useBiometric();
  const appState = useRef(AppState.currentState);

  // Store form data when app goes to background (if biometric is enabled)
  useEffect(() => {
    if (!enabled || !isBiometricEnabled) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        // App is going to background - save form data
        if (formData && Object.keys(formData).length > 0) {
          storeFormData(formId, formData);
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [formId, formData, enabled, isBiometricEnabled]);

  const storeFormData = async (id: string, data: any) => {
    try {
      const key = `${FORM_DATA_PREFIX}${id}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error storing form data:', error);
    }
  };

  const restoreFormData = async (id: string): Promise<any | null> => {
    try {
      const key = `${FORM_DATA_PREFIX}${id}`;
      const stored = await AsyncStorage.getItem(key);
      
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        
        // Check if data is not too old (30 minutes max for forms)
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - timestamp < thirtyMinutes) {
          // Remove the stored data after restoring
          await AsyncStorage.removeItem(key);
          return data;
        } else {
          // Remove expired data
          await AsyncStorage.removeItem(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error restoring form data:', error);
      return null;
    }
  };

  const clearFormData = async (id: string) => {
    try {
      const key = `${FORM_DATA_PREFIX}${id}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  };

  return {
    restoreFormData,
    clearFormData,
  };
}
