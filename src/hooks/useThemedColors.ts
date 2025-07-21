import { useTheme } from 'react-native-paper';
import { useColorScheme } from '@/src/store/ThemeContext';
import { Theme, getDebtColors, getStatusColors } from '@/src/constants/theme';

export interface ThemedColors {
  // All theme colors
  [key: string]: any;
  
  // Helper methods for common use cases
  getDebtColor: (type: 'gave' | 'got') => string;
  getDebtBackgroundColor: (type: 'gave' | 'got') => string;
  getDebtOnContainerColor: (type: 'gave' | 'got') => string;
  getStatusColor: (status: 'paid' | 'pending' | 'overdue' | undefined) => string;
  getStatusBackgroundColor: (status: 'paid' | 'pending' | 'overdue' | undefined) => string;
  getStatusOnContainerColor: (status: 'paid' | 'pending' | 'overdue' | undefined) => string;
  
  // Convenience properties
  isDark: boolean;
}

export const useThemedColors = (): ThemedColors => {
  const theme = useTheme<Theme>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    ...theme.colors,
    isDark,
    getDebtColor: (type: 'gave' | 'got') => getDebtColors(type, isDark).color,
    getDebtBackgroundColor: (type: 'gave' | 'got') => getDebtColors(type, isDark).backgroundColor,
    getDebtOnContainerColor: (type: 'gave' | 'got') => getDebtColors(type, isDark).onContainer,
    getStatusColor: (status: 'paid' | 'pending' | 'overdue' | undefined) => getStatusColors(status, isDark).color,
    getStatusBackgroundColor: (status: 'paid' | 'pending' | 'overdue' | undefined) => getStatusColors(status, isDark).backgroundColor,
    getStatusOnContainerColor: (status: 'paid' | 'pending' | 'overdue' | undefined) => getStatusColors(status, isDark).onContainer,
  };
};

// Helper hook for creating theme-aware styles
export const useThemedStyles = <T extends Record<string, any>>(
  styleFactory: (colors: ThemedColors, isDark: boolean) => T
): T => {
  const colors = useThemedColors();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return styleFactory(colors, isDark);
};
