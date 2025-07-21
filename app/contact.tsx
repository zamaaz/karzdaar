import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, List, Card } from 'react-native-paper';
import { ScreenLayout } from '@/src/components/common';
import { useThemedStyles } from '@/src/hooks/useThemedColors';

export default function ContactScreen() {
  const styles = useThemedStyles(createStyles);

  const handleEmailPress = () => {
    Linking.openURL('mailto:zamaazdeveloper@gmail.com');
  };

  const handleGitHubPress = () => {
    Linking.openURL('https://github.com/zamaaz/karzdaar');
  };

  return (
    <ScreenLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          Contact & Support
        </Text>
        
        <Text variant="bodyMedium" style={styles.subtitle}>
          Get in touch with us for any questions, feedback, or support regarding Karzdaar.
        </Text>

        <Card style={styles.contactCard}>
          <Card.Content>
            <List.Item
              title="Email Support"
              description="zamaazdeveloper@gmail.com"
              left={(props) => <List.Icon {...props} icon="email" />}
              onPress={handleEmailPress}
              style={styles.listItem}
            />
            
            <List.Item
              title="GitHub Repository"
              description="github.com/zamaaz/karzdaar"
              left={(props) => <List.Icon {...props} icon="github" />}
              onPress={handleGitHubPress}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              What can we help you with?
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • Bug reports and technical issues
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • Feature requests and suggestions
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • General questions about the app
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • Privacy and security concerns
            </Text>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.responseTime}>
          We typically respond within 24-48 hours.
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
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  contactCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  infoCard: {
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  listItem: {
    paddingVertical: 8,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.onSurface,
  },
  infoText: {
    marginBottom: 6,
    marginLeft: 8,
    color: colors.onSurface,
  },
  responseTime: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
