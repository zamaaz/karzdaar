import React from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/src/store/ThemeContext';
import { lightTheme, darkTheme } from '@/src/constants/theme';
import { DebtProvider, BiometricProvider, useBiometric, ThemeProvider } from '@/src/store';
import BiometricLockScreen from '@/src/screens/BiometricLockScreen';

// Suppress annoying warnings
LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component',
  'Warning: Each child in a list should have a unique "key" prop',
  'Warning: Failed prop type',
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount',
  'VirtualizedLists should never be nested',
  'Setting a timer for a long period of time',
  // React Navigation warnings
  'Non-serializable values were found in the navigation state',
  'The action',
  // Gesture handler warnings
  'RNGestureHandlerModule',
  'Sending',
]);

function AppContent() {
  const { colorScheme } = useColorScheme();
  const { isLocked, isBiometricEnabled } = useBiometric();
  
  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Show lock screen if biometric is enabled and app is locked
  if (isBiometricEnabled && isLocked) {
    return (
      <PaperProvider theme={paperTheme}>
        <BiometricLockScreen />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <PaperProvider theme={paperTheme}>
        <Stack
          screenOptions={{
            // Native iOS-style push transitions like WhatsApp
            animation: 'slide_from_right',
            presentation: 'card',
            // Prevent white flash during navigation
            contentStyle: { backgroundColor: paperTheme.colors.background },
            // Enable native-style gestures and animations
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            // Default header styling
            headerStyle: {
              backgroundColor: paperTheme.colors.surface,
            },
            headerTintColor: paperTheme.colors.onSurface,
            headerTitleStyle: {
              color: paperTheme.colors.onSurface,
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              title: 'Settings',
              headerShown: true,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen 
            name="add-debt" 
            options={{ 
              title: 'Add Debt',
              headerShown: true,
              animation: 'slide_from_right',
              presentation: 'card',
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen 
            name="add-customer" 
            options={{ 
              title: 'Add Customer',
              headerShown: true,
              animation: 'slide_from_right',
              presentation: 'card',
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen 
            name="debt/[id]" 
            options={{ 
              title: 'Debt Details',
              headerShown: true,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen 
            name="customer/[name]" 
            options={{ 
              title: 'Customer Details',
              headerShown: true,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen 
            name="entry/[id]" 
            options={{ 
              title: 'Entry Details',
              headerShown: true,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen 
            name="privacy-policy" 
            options={{ 
              title: 'Privacy Policy',
              headerShown: true,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen 
            name="contact" 
            options={{ 
              title: 'Contact & Support',
              headerShown: true,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: paperTheme.colors.background },
            }} 
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

  if (!loaded) {
    return (
      <PaperProvider theme={paperTheme}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <ThemeProvider>
      <DebtProvider>
        <BiometricProvider>
          <AppContent />
        </BiometricProvider>
      </DebtProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});