import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { ScreenLayout } from '@/src/components/common';
import { useThemedStyles } from '@/src/hooks/useThemedColors';

export default function PrivacyPolicyScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <ScreenLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          Privacy Policy for Karzdaar
        </Text>
        
        <Text variant="bodyMedium" style={styles.lastUpdated}>
          Last updated: July 21, 2025
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Introduction
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          Karzdaar ("we," "our," or "us") is a mobile application designed to help users track debts and financial transactions between individuals. This Privacy Policy explains how we handle your information and your privacy rights when you use our App.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Information Collection and Use
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          Karzdaar is designed with privacy at its core. We want to be clear about our practices:
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • No Data Collection: We do not collect, store, or transmit any personal information to external servers.
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Local Storage Only: All data, including debt records and transaction history, is stored exclusively on your device.
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • No Internet Required: The App functions completely offline and does not require internet connectivity for core features.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Types of Data Stored Locally
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          The App stores the following information locally on your device:
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Debt Records: Customer names, transaction amounts, dates, and notes
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • App Settings: Your preferences, theme settings, and notification configurations
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Biometric Authentication Data: Managed securely by your device's operating system
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Local Database: Financial transaction data stored in a local database on your device
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Permissions
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          Karzdaar may request the following permissions:
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Biometric Authentication: For secure access to your financial information (optional)
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Notification Permission: To send payment reminders and alerts (optional)
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          These permissions can be revoked at any time through your device settings.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Data Security
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          We implement appropriate technical measures to maintain the security of your information:
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • All data is stored exclusively on your device
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Optional biometric authentication for additional security
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • No data transmission to external servers
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • No cloud backup or sync features
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Children's Privacy
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          Our App does not knowingly collect any personal information. Since all data is processed locally, parents can monitor and control their children's use of the App through device-level controls.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Changes to This Privacy Policy
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy and updating the "Last updated" date.
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Your Rights
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          Since all data is stored locally on your device, you have complete control over your data. You can:
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Clear app data through your device settings
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Uninstall the app to remove all data
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Delete specific records within the app
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Control permissions through device settings
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Contact Us
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Email: zamaazdeveloper@gmail.com
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • GitHub: github.com/zamaaz/karzdaar
        </Text>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Disclaimer
        </Text>
        <Text variant="bodyMedium" style={styles.paragraph}>
          Karzdaar is a personal finance tracking tool. We are not responsible for:
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Any financial decisions made based on the App's data
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Loss of data due to device malfunction or app uninstallation
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Unauthorized access to your device
        </Text>
        <Text variant="bodyMedium" style={styles.bulletPoint}>
          • Any issues arising from permission changes or system modifications
        </Text>

        <Text variant="bodySmall" style={styles.footer}>
          By using Karzdaar, you agree to the terms outlined in this Privacy Policy.
        </Text>
        
        <Text variant="bodySmall" style={styles.copyright}>
          © 2025 • Maaz Zama
        </Text>
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
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.onBackground,
    textAlign: 'center',
  },
  lastUpdated: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: colors.onBackground,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 22,
    color: colors.onSurface,
  },
  bulletPoint: {
    marginBottom: 6,
    marginLeft: 8,
    lineHeight: 20,
    color: colors.onSurface,
  },
  footer: {
    marginTop: 24,
    fontStyle: 'italic',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  copyright: {
    marginTop: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontWeight: '500',
  },
});
