import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function NotFoundScreen() {
  const theme = useTheme();
  
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginBottom: 20 }}>
          This screen does not exist.
        </Text>
        <Link href="/" style={styles.link}>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
