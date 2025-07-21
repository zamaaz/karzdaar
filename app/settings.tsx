import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Switch, List, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenLayout } from '@/src/components/common';
import { useThemedStyles } from '@/src/hooks/useThemedColors';
import { useColorScheme } from '@/src/store/ThemeContext';
import { useBiometric } from '@/src/store';

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { isBiometricEnabled, toggleBiometricLock } = useBiometric();
  const styles = useThemedStyles(createStyles);

  const isDarkMode = colorScheme === 'dark';

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleContact = () => {
    router.push('/contact' as any);
  };

  return (
    <ScreenLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Settings List */}
        <View style={styles.settingsSection}>
          {/* Dark Mode Toggle */}
          <List.Item
            title="Dark Mode"
            description="Toggle dark/light theme"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleColorScheme}
                style={styles.switchControl}
                ios_backgroundColor={isDarkMode ? '#3F3F3F' : '#E6E6E6'}
              />
            )}
            style={styles.listItem}
          />

           <Divider style={styles.divider} />
          
          {/* Biometric Lock Toggle */}
          <List.Item
            title="Biometric Lock"
            description="Require authentication to open the app"
            left={(props) => <List.Icon {...props} icon="fingerprint" />}
            right={() => (
              <Switch
                value={isBiometricEnabled}
                onValueChange={toggleBiometricLock}
                style={styles.switchControl}
                ios_backgroundColor={isDarkMode ? '#3F3F3F' : '#E6E6E6'}
              />
            )}
            style={styles.listItem}
          />
          
          <Divider style={styles.divider} />
          
          {/* Privacy Policy */}
          <List.Item
            title="Privacy Policy"
            description="How we protect your data"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handlePrivacyPolicy}
            style={styles.listItem}
          />
          
          <Divider style={styles.divider} />
          
          {/* Contact */}
          <List.Item
            title="Contact"
            description="Get help and support"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleContact}
            style={styles.listItem}
          />
          
          <Divider style={styles.divider} />
          
          {/* App Version */}
          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
            style={styles.listItem}
          />
          
          <Divider style={styles.divider} />
          
          {/* Created by */}
          <List.Item
            title="Created with ❤️ by MAAZ ZAMA"
            titleStyle={styles.createdByText}
            style={[styles.listItem, styles.createdByItem]}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  settingsSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  divider: {
    marginHorizontal: 16,
    backgroundColor: colors.outlineVariant,
  },
  switchControl: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }], // Larger Material 3 switches
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  createdByItem: {
    paddingVertical: 12,
    justifyContent: 'center',
  },
  createdByText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    color: colors.primary,
  },
});
