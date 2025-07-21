import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { 
  MaterialIcon, 
  ThemedIconButton, 
  ThemedFAB, 
  semanticIcons, 
  iconSizes
} from '@/src/components/common';

/**
 * Demo component showcasing the Material You icon implementation
 * This is for development and testing purposes
 */
export function IconShowcase() {
  const handleIconPress = (iconName: string) => {
    console.log(`Pressed icon: ${iconName}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Material You Icons Showcase
      </Text>
      
      {/* Basic MaterialIcon Examples */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Basic MaterialIcon Component
          </Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={24} themeColor="primary" />
              <Text variant="bodySmall">home</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="cog" size={24} themeColor="secondary" />
              <Text variant="bodySmall">settings</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="account-plus" size={24} themeColor="onSurface" />
              <Text variant="bodySmall">add user</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="shield-check" size={24} themeColor="primary" />
              <Text variant="bodySmall">security</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Icon Sizes Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Icon Sizes
          </Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={iconSizes.small} />
              <Text variant="bodySmall">small (16px)</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={iconSizes.medium} />
              <Text variant="bodySmall">medium (24px)</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={iconSizes.large} />
              <Text variant="bodySmall">large (32px)</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={iconSizes.extraLarge} />
              <Text variant="bodySmall">extra large (48px)</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* ThemedIconButton Examples */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            ThemedIconButton Component
          </Text>
          <View style={styles.iconRow}>
            <ThemedIconButton
              icon="settings"
              size="medium"
              colorContext="navigation"
              onPress={() => handleIconPress('settings')}
            />
            <ThemedIconButton
              icon="add"
              size="medium"
              colorContext="interactive"
              onPress={() => handleIconPress('add')}
            />
            <ThemedIconButton
              icon="edit"
              size="medium"
              colorContext="primary"
              onPress={() => handleIconPress('edit')}
            />
            <ThemedIconButton
              icon="delete"
              size="medium"
              colorContext="error"
              onPress={() => handleIconPress('delete')}
            />
          </View>
        </Card.Content>
      </Card>

      {/* ThemedFAB Examples */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            ThemedFAB Component
          </Text>
          <View style={styles.fabRow}>
            <ThemedFAB
              icon="personAdd"
              size="medium"
              variant="primary"
              onPress={() => handleIconPress('add-person')}
            />
            <ThemedFAB
              icon="add"
              size="small"
              variant="secondary"
              onPress={() => handleIconPress('add-secondary')}
            />
            <ThemedFAB
              icon="edit"
              size="medium"
              variant="tertiary"
              onPress={() => handleIconPress('edit-tertiary')}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Common Semantic Icons */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Semantic Icon Examples
          </Text>
          
          <Text variant="bodyMedium" style={styles.categoryTitle}>Navigation</Text>
          <View style={styles.iconRow}>
            {['home', 'back', 'forward', 'settings', 'search'].map((iconKey) => (
              <View key={iconKey} style={styles.iconItem}>
                <MaterialIcon 
                  name={semanticIcons[iconKey as keyof typeof semanticIcons] as any} 
                  size={24} 
                />
                <Text variant="bodySmall">{iconKey}</Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          <Text variant="bodyMedium" style={styles.categoryTitle}>Actions</Text>
          <View style={styles.iconRow}>
            {['add', 'edit', 'delete', 'save', 'share'].map((iconKey) => (
              <View key={iconKey} style={styles.iconItem}>
                <MaterialIcon 
                  name={semanticIcons[iconKey as keyof typeof semanticIcons] as any} 
                  size={24} 
                />
                <Text variant="bodySmall">{iconKey}</Text>
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          <Text variant="bodyMedium" style={styles.categoryTitle}>Security</Text>
          <View style={styles.iconRow}>
            {['lock', 'unlock', 'fingerprint', 'shield'].map((iconKey) => (
              <View key={iconKey} style={styles.iconItem}>
                <MaterialIcon 
                  name={semanticIcons[iconKey as keyof typeof semanticIcons] as any} 
                  size={24} 
                />
                <Text variant="bodySmall">{iconKey}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Theme Color Examples */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Theme Color Adaptation
          </Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={24} themeColor="primary" />
              <Text variant="bodySmall">primary</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={24} themeColor="secondary" />
              <Text variant="bodySmall">secondary</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={24} themeColor="onSurface" />
              <Text variant="bodySmall">onSurface</Text>
            </View>
            <View style={styles.iconItem}>
              <MaterialIcon name="home" size={24} themeColor="onSurfaceVariant" />
              <Text variant="bodySmall">onSurfaceVariant</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  categoryTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '500',
    opacity: 0.8,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-around',
  },
  fabRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  iconItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  divider: {
    marginVertical: 12,
  },
});
