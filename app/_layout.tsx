import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, LogBox, AppState, AppStateStatus } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
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
  'Non-serializable values were found in the navigation state',
  'The action',
  'RNGestureHandlerModule',
  'Sending',
]);

// --- THE FIX: Isolate the Navigator ---
// By wrapping the Stack in React.memo, we prevent it from re-rendering
// unless its props (paperTheme) change. This makes it immune to any
// unnecessary re-renders from its parent component (AppContent).
const MainNavigator = React.memo(({ paperTheme }: { paperTheme: any }) => {
  // This log will help us confirm the fix. It should now only appear
  // when the theme actually changes, not on every keystroke.
  console.log('--- MainNavigator is rendering ---');

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        presentation: 'card',
        contentStyle: { backgroundColor: paperTheme.colors.background },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
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
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="add-debt" 
        options={{ 
          title: 'Add Debt',
          headerShown: true,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="add-customer" 
        options={{ 
          title: 'Add Customer',
          headerShown: true,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="debt/[id]" 
        options={{ 
          title: 'Debt Details',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="customer/[name]" 
        options={{ 
          title: 'Customer Details',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="entry/[id]" 
        options={{ 
          title: 'Entry Details',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="privacy-policy" 
        options={{ 
          title: 'Privacy Policy',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="contact" 
        options={{ 
          title: 'Contact & Support',
          headerShown: true,
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
});

function AppContent() {
  const { colorScheme } = useColorScheme();
  const { 
    isLocked, 
    isBiometricEnabled, 
    previousNavigationState, 
    storeNavigationState, 
    clearNavigationState 
  } = useBiometric();
  const router = useRouter();
  const segments = useSegments();
  const appState = useRef(AppState.currentState);

  const segmentsString = useMemo(() => segments.join('/'), [segments]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (isBiometricEnabled && segments.length > 0) {
          const currentRoute = segments.join('/');
          if (currentRoute && currentRoute !== '' && !currentRoute.includes('index')) {
            storeNavigationState({
              routeName: currentRoute,
              params: {},
            });
          }
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isBiometricEnabled, segmentsString, storeNavigationState]);

  useEffect(() => {
    if (!isLocked && previousNavigationState && previousNavigationState.routeName) {
      const timer = setTimeout(() => {
        try {
          const routeName = previousNavigationState.routeName.startsWith('/') 
            ? previousNavigationState.routeName 
            : `/${previousNavigationState.routeName}`;
          
          router.push(routeName as any);
          clearNavigationState();
        } catch (error) {
          console.error('Error restoring navigation:', error);
          router.push('/');
          clearNavigationState();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLocked, previousNavigationState, router, clearNavigationState]);
  
  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

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
        <MainNavigator paperTheme={paperTheme} />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
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