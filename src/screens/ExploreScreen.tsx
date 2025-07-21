import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, Divider, Switch, Card } from 'react-native-paper';
import { ScreenLayout, AlertDialog } from '@/src/components/common';
import { useBiometric } from '@/src/store';
import { useColorScheme } from '@/src/store/ThemeContext';
import { useThemedStyles } from '@/src/hooks/useThemedColors';

export default function ExploreScreen() {
  const { 
    isBiometricEnabled, 
    isBiometricSupported, 
    toggleBiometricLock,
    isAuthenticating 
  } = useBiometric();

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const styles = useThemedStyles(createStyles);
  
  // Dialog state
  const [alertDialog, setAlertDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  // Helper function for showing alert dialogs
  const showAlert = (title: string, message: string) => {
    setAlertDialog({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertDialog({ visible: false, title: '', message: '' });
  };

  const handleBiometricToggle = async () => {
    if (!isBiometricSupported) {
      showAlert(
        'Not Available',
        'Biometric authentication is not available on this device. Please ensure you have fingerprint or face recognition set up in your device settings.'
      );
      return;
    }

    await toggleBiometricLock();
  };

  const getBiometricStatusText = () => {
    if (!isBiometricSupported) {
      return 'Not available on this device';
    }
    return isBiometricEnabled ? 'App will lock when minimized' : 'App stays unlocked';
  };

  return (
    <ScreenLayout scrollable>
      <View style={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Settings
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          Configure your app preferences
        </Text>

        {/* Security Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🔒 Security
            </Text>
            
            <List.Item
              title="Biometric Lock"
              description={getBiometricStatusText()}
              left={props => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={isBiometricEnabled && isBiometricSupported}
                  onValueChange={handleBiometricToggle}
                  disabled={!isBiometricSupported || isAuthenticating}
                />
              )}
              onPress={handleBiometricToggle}
              disabled={!isBiometricSupported || isAuthenticating}
            />
            
            <Text variant="bodySmall" style={styles.biometricHint}>
              {isBiometricSupported 
                ? '💡 Use fingerprint or face recognition to secure your financial data'
                : '⚠️ Enable biometric authentication in your device settings to use this feature'
              }
            </Text>
          </Card.Content>
        </Card>

        {/* Theme Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🎨 Appearance
            </Text>
            
            <List.Item
              title="Dark Mode"
              description={`Currently using ${colorScheme} theme`}
              left={props => <List.Icon {...props} icon={colorScheme === 'dark' ? 'weather-night' : 'white-balance-sunny'} />}
              right={() => (
                <Switch
                  value={colorScheme === 'dark'}
                  onValueChange={toggleColorScheme}
                />
              )}
              onPress={toggleColorScheme}
            />
            
            <Text variant="bodySmall" style={styles.themeHint}>
              🌗 Toggle between light and dark themes. Your preference will be saved automatically.
            </Text>
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📱 About
            </Text>

            <List.Item
              title="App Version"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              description="How we protect your data"
              left={props => <List.Icon {...props} icon="shield-check" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              description="App usage terms"
              left={props => <List.Icon {...props} icon="file-document" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🆘 Support
            </Text>

            <List.Item
              title="Help & FAQ"
              description="Get help with common questions"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="Contact Support"
              description="Get in touch with our team"
              left={props => <List.Icon {...props} icon="email" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </View>

      {/* Alert Dialog */}
      <AlertDialog
        visible={alertDialog.visible}
        onDismiss={hideAlert}
        title={alertDialog.title}
        message={alertDialog.message}
      />
    </ScreenLayout>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: colors.onSurfaceVariant,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.primary,
  },
  biometricHint: {
    textAlign: 'left',
    color: colors.onSurfaceVariant,
    marginTop: 8,
    marginHorizontal: 16,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  themeHint: {
    textAlign: 'left',
    color: colors.onSurfaceVariant,
    marginTop: 8,
    marginHorizontal: 16,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 80,
  },
});
