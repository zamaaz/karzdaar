import React from 'react';
import { StyleSheet, ViewStyle, ScrollView, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
}) => {
  const theme = useTheme();

  const containerStyle = [
    styles.container,
    { backgroundColor: theme.colors.background },
    style,
  ];

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <View style={[styles.surface, contentContainerStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
