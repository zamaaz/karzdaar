import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  ActivityIndicator,
  IconButton
} from 'react-native-paper';
import { ScreenLayout, ConfirmDialog } from '@/src/components/common';
import { useBiometric } from '@/src/store';
import { useThemedColors, useThemedStyles } from '@/src/hooks/useThemedColors';

export default function BiometricLockScreen() {
  const { 
    authenticateWithBiometric, 
    unlockApp, 
    isAuthenticating,
    isBiometricSupported 
  } = useBiometric();

  const [authFailedCount, setAuthFailedCount] = useState(0);
  const [showAuthFailedDialog, setShowAuthFailedDialog] = useState(false);
  const colors = useThemedColors();
  const styles = useThemedStyles(createStyles);

  const handleAuthenticate = useCallback(async () => {
    if (!isBiometricSupported) {
      // If biometric is not supported but lock is enabled, just unlock
      // This shouldn't happen in normal flow but is a safety fallback
      unlockApp();
      return;
    }

    try {
      const success = await authenticateWithBiometric();
      if (success) {
        unlockApp();
        setAuthFailedCount(0); // Reset failure count on success
      } else {
        // Authentication failed or was cancelled
        setAuthFailedCount(prev => prev + 1);
        
        // After 3 failed attempts, show option to skip
        if (authFailedCount >= 2) {
          setShowAuthFailedDialog(true);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthFailedCount(prev => prev + 1);
    }
  }, [isBiometricSupported, authenticateWithBiometric, unlockApp, authFailedCount]);

  // Auto-prompt for authentication when screen loads, but only once
  useEffect(() => {
    // Only auto-prompt if no previous failures and user hasn't manually tried
    if (authFailedCount === 0) {
      const timer = setTimeout(async () => {
        if (!isBiometricSupported) {
          unlockApp();
          return;
        }

        try {
          const success = await authenticateWithBiometric();
          if (success) {
            unlockApp();
          } else {
            setAuthFailedCount(1); // Mark that auto-attempt failed
          }
        } catch (error) {
          console.error('Auto-authentication error:', error);
          setAuthFailedCount(1);
        }
      }, 500); // Small delay to let the screen render
      
      return () => clearTimeout(timer);
    }
  }, [authFailedCount, isBiometricSupported, authenticateWithBiometric, unlockApp]);

  // Handle app state changes - lock when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is going to background - we're already locked
      } else if (nextAppState === 'active') {
        // App is coming to foreground - prompt for authentication
        handleAuthenticate();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [handleAuthenticate]);

  const handleManualUnlock = () => {
    // Fallback option to unlock without biometric
    unlockApp();
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* App Logo/Icon */}
          <View style={styles.logoContainer}>
            <IconButton
              icon="shield-lock"
              size={80}
              iconColor={colors.primary}
            />
          </View>

          {/* Title */}
          <Text variant="headlineMedium" style={styles.title}>
            Karzdaar
          </Text>
          
          <Text variant="bodyLarge" style={styles.subtitle}>
            Your debt management app is locked
          </Text>

          {/* Show failure message if authentication failed */}
          {authFailedCount > 0 && (
            <Text variant="bodyMedium" style={styles.errorText}>
              {authFailedCount === 1 
                ? 'Authentication failed. Please try again.' 
                : `Authentication failed ${authFailedCount} times.`
              }
            </Text>
          )}

          {/* Authentication Card */}
          <Card style={styles.authCard}>
            <Card.Content style={styles.cardContent}>
              {isAuthenticating ? (
                <>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text variant="bodyMedium" style={styles.authenticatingText}>
                    Authenticating...
                  </Text>
                </>
              ) : (
                <>
                  <IconButton
                    icon="fingerprint"
                    size={48}
                    iconColor={colors.primary}
                    style={styles.biometricIcon}
                  />
                  
                  <Text variant="titleMedium" style={styles.authTitle}>
                    {isBiometricSupported ? 'Use Biometric Authentication' : 'Authentication Required'}
                  </Text>
                  
                  <Text variant="bodyMedium" style={styles.authDescription}>
                    {isBiometricSupported 
                      ? 'Use your fingerprint or face recognition to unlock the app'
                      : 'Biometric authentication is not available'
                    }
                  </Text>

                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained"
                      onPress={handleAuthenticate}
                      style={styles.authButton}
                      disabled={isAuthenticating}
                      icon={isBiometricSupported ? "fingerprint" : "lock-open"}
                    >
                      {isBiometricSupported ? 'Try Again' : 'Unlock'}
                    </Button>

                    {(isBiometricSupported && authFailedCount >= 2) && (
                      <Button
                        mode="outlined"
                        onPress={handleManualUnlock}
                        style={styles.fallbackButton}
                        disabled={isAuthenticating}
                      >
                        Skip Authentication
                      </Button>
                    )}
                  </View>
                </>
              )}
            </Card.Content>
          </Card>

          {/* Security Note */}
          <Text variant="bodySmall" style={styles.securityNote}>
            🔒 Your financial data is protected with device security
          </Text>
        </View>
      </View>

      {/* Authentication Failed Dialog */}
      <ConfirmDialog
        visible={showAuthFailedDialog}
        onDismiss={() => {
          setAuthFailedCount(0);
          setShowAuthFailedDialog(false);
        }}
        title="Authentication Failed"
        message="Multiple authentication attempts failed. You can skip authentication or try again."
        onConfirm={unlockApp}
        confirmText="Skip Authentication"
        cancelText="Try Again"
      />
    </ScreenLayout>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.primaryContainer,
    borderRadius: 50,
  },
  title: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  authCard: {
    width: '100%',
    elevation: 4,
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  biometricIcon: {
    marginBottom: 16,
    backgroundColor: colors.primaryContainer,
  },
  authTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: colors.primary,
  },
  authDescription: {
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  authButton: {
    marginBottom: 8,
  },
  fallbackButton: {
    borderColor: colors.outline,
  },
  authenticatingText: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
  },
  securityNote: {
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 16,
  },
});
