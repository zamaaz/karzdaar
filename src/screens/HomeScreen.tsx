import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { ScreenLayout } from '@/src/components/common';

export default function HomeScreen() {
  return (
    <ScreenLayout scrollable>
      <View style={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome to Karzdaar
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          Your app is ready to build amazing things!
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Next Steps</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              • Customize your theme in src/constants/theme.ts
              • Add your screens in src/screens/
              • Create reusable components in src/components/
              • Set up your API services in src/services/
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => console.log('Button pressed!')}
        >
          Get Started
        </Button>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    marginBottom: 24,
  },
  cardText: {
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
  },
});
