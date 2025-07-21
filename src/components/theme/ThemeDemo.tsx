import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Text, 
  Card, 
  Chip, 
  Button, 
  Surface
} from 'react-native-paper';
import { useThemedColors, useThemedStyles } from '@/src/hooks/useThemedColors';

/**
 * ThemeDemo component shows how to properly use MD3 theming
 * with React Native Paper in both light and dark modes.
 */
export default function ThemeDemo() {
  const colors = useThemedColors();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Theme Demo - MD3 Colors
      </Text>
      
      {/* Surface Hierarchy Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Surface Hierarchy
          </Text>
          
          <Surface style={styles.surfaceContainer} elevation={0}>
            <Text style={styles.surfaceLabel}>Surface Container</Text>
            
            <Surface style={styles.surfaceContainerHigh} elevation={1}>
              <Text style={styles.surfaceLabel}>Surface Container High</Text>
              
              <Surface style={styles.surfaceContainerHighest} elevation={2}>
                <Text style={styles.surfaceLabel}>Surface Container Highest</Text>
              </Surface>
            </Surface>
          </Surface>
        </Card.Content>
      </Card>

      {/* Financial Colors Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Financial Colors
          </Text>
          
          <View style={styles.chipRow}>
            <Chip 
              mode="outlined"
              style={[
                styles.chip,
                { 
                  backgroundColor: colors.getDebtBackgroundColor('gave'),
                  borderColor: colors.getDebtColor('gave')
                }
              ]}
              textStyle={{ color: colors.getDebtOnContainerColor('gave') }}
            >
              Credit (You Gave)
            </Chip>
            
            <Chip 
              mode="outlined"
              style={[
                styles.chip,
                { 
                  backgroundColor: colors.getDebtBackgroundColor('got'),
                  borderColor: colors.getDebtColor('got')
                }
              ]}
              textStyle={{ color: colors.getDebtOnContainerColor('got') }}
            >
              Debt (You Owe)
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Status Colors Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Status Colors
          </Text>
          
          <View style={styles.chipRow}>
            <Chip 
              mode="outlined"
              style={[
                styles.chip,
                { 
                  backgroundColor: colors.getStatusBackgroundColor('paid'),
                  borderColor: colors.getStatusColor('paid')
                }
              ]}
              textStyle={{ color: colors.getStatusOnContainerColor('paid') }}
            >
              Paid
            </Chip>
            
            <Chip 
              mode="outlined"
              style={[
                styles.chip,
                { 
                  backgroundColor: colors.getStatusBackgroundColor('pending'),
                  borderColor: colors.getStatusColor('pending')
                }
              ]}
              textStyle={{ color: colors.getStatusOnContainerColor('pending') }}
            >
              Pending
            </Chip>
            
            <Chip 
              mode="outlined"
              style={[
                styles.chip,
                { 
                  backgroundColor: colors.getStatusBackgroundColor('overdue'),
                  borderColor: colors.getStatusColor('overdue')
                }
              ]}
              textStyle={{ color: colors.getStatusOnContainerColor('overdue') }}
            >
              Overdue
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Text Colors Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Text Hierarchy
          </Text>
          
          <Text style={[styles.textExample, { color: colors.onSurface }]}>
            Primary text (onSurface)
          </Text>
          <Text style={[styles.textExample, { color: colors.onSurfaceVariant }]}>
            Secondary text (onSurfaceVariant)
          </Text>
          <Text style={[styles.textExample, { color: colors.outline }]}>
            Tertiary text (outline)
          </Text>
        </Card.Content>
      </Card>

      {/* Button Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Buttons
          </Text>
          
          <View style={styles.buttonRow}>
            <Button mode="contained" style={styles.button}>
              Primary Button
            </Button>
            <Button mode="outlined" style={styles.button}>
              Secondary Button
            </Button>
            <Button mode="text" style={styles.button}>
              Text Button
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Theme Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Current Theme
          </Text>
          
          <Text style={styles.themeInfo}>
            Mode: {colors.isDark ? 'Dark' : 'Light'}
          </Text>
          <Text style={styles.themeInfo}>
            Background: {colors.background}
          </Text>
          <Text style={styles.themeInfo}>
            Surface: {colors.surface}
          </Text>
          <Text style={styles.themeInfo}>
            Primary: {colors.primary}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: colors.onBackground,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    marginBottom: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  surfaceContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainer || colors.surfaceVariant,
    marginBottom: 8,
  },
  surfaceContainerHigh: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerHigh || colors.surface,
    marginBottom: 8,
  },
  surfaceContainerHighest: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerHighest || colors.surface,
  },
  surfaceLabel: {
    fontSize: 12,
    color: colors.onSurface,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 4,
  },
  textExample: {
    fontSize: 14,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    marginBottom: 8,
  },
  themeInfo: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
