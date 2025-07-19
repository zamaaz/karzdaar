import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { ScreenLayout } from '@/src/components/common';

export default function ExploreScreen() {
  return (
    <ScreenLayout scrollable>
      <View style={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Explore
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          Discover new features and content
        </Text>

        <List.Section>
          <List.Subheader>Categories</List.Subheader>
          <List.Item
            title="Technology"
            description="Latest in tech"
            left={props => <List.Icon {...props} icon="laptop" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Design"
            description="UI/UX and graphics"
            left={props => <List.Icon {...props} icon="palette" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Business"
            description="Entrepreneurship tips"
            left={props => <List.Icon {...props} icon="briefcase" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Lifestyle"
            description="Health and wellness"
            left={props => <List.Icon {...props} icon="heart" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>
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
});
