import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';

interface ToastContextType {
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    type: 'info' | 'success' | 'error';
  }>({ visible: false, message: '', type: 'info' });

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastState({ visible: true, message, type });
  };

  const hideToast = () => {
    setToastState(prev => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={toastState.visible}
        onDismiss={hideToast}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: hideToast,
        }}
        style={{
          backgroundColor: 
            toastState.type === 'error' ? '#F44336' : 
            toastState.type === 'success' ? '#4CAF50' : 
            '#2196F3'
        }}
      >
        {toastState.message}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
