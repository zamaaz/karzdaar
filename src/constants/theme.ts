import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Custom colors for Karzdaar app following MD3 guidelines
const customColors = {
  light: {
    // Financial colors - using MD3 semantic colors
    credit: '#1B5E20',        // Dark green for better contrast
    debt: '#B71C1C',          // Dark red for better contrast  
    creditContainer: '#E8F5E9', // Light green container
    debtContainer: '#FFEBEE',   // Light red container
    creditOnContainer: '#2E7D32', // Text on green container
    debtOnContainer: '#D32F2F',   // Text on red container
    
    // Status colors with MD3 approach
    paid: '#2E7D32',          // Success green
    pending: '#F57C00',       // Warning orange
    overdue: '#D32F2F',       // Error red
    paidContainer: '#E8F5E9',
    pendingContainer: '#FFF3E0',
    overdueContainer: '#FFEBEE',
    
    // Enhanced surface colors
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F7F7F7',
    surfaceContainer: '#F3F3F3',
    surfaceContainerHigh: '#ECECEC',
    surfaceContainerHighest: '#E6E6E6',
    
    // Text colors following MD3
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
  },
  dark: {
    // Financial colors for dark mode
    credit: '#81C784',        // Light green for dark backgrounds
    debt: '#E57373',          // Light red for dark backgrounds
    creditContainer: '#1B5E20', // Dark green container  
    debtContainer: '#B71C1C',   // Dark red container
    creditOnContainer: '#C8E6C9', // Light text on dark green
    debtOnContainer: '#FFCDD2',   // Light text on dark red
    
    // Status colors for dark mode
    paid: '#81C784',
    pending: '#FFB74D', 
    overdue: '#E57373',
    paidContainer: '#1B5E20',
    pendingContainer: '#E65100',
    overdueContainer: '#B71C1C',
    
    // Enhanced surface colors for dark mode
    surfaceContainerLowest: '#0F0F0F',
    surfaceContainerLow: '#1D1B20',
    surfaceContainer: '#211F26',
    surfaceContainerHigh: '#2B2930',
    surfaceContainerHighest: '#36343B',
    
    // Text colors for dark mode
    onSurfaceVariant: '#CAC4D0',
    outline: '#938F99',
    outlineVariant: '#49454F',
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Override MD3 colors with our custom palette
    primary: '#1976D2',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E3F2FD',
    onPrimaryContainer: '#0D47A1',
    
    secondary: '#1565C0', 
    onSecondary: '#FFFFFF',
    secondaryContainer: '#BBDEFB',
    onSecondaryContainer: '#0277BD',
    
    // Surface hierarchy
    surface: '#FEFBFF',
    onSurface: '#1D1B20',
    surfaceVariant: '#E7E0EC',
    
    // Background
    background: '#FEFBFF',
    onBackground: '#1D1B20',
    
    // Custom app colors (including onSurfaceVariant override)
    ...customColors.light,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Override MD3 colors with our custom palette  
    primary: '#90CAF9',
    onPrimary: '#003258',
    primaryContainer: '#004881',
    onPrimaryContainer: '#C8E6FF',
    
    secondary: '#90CAF9',
    onSecondary: '#003258', 
    secondaryContainer: '#004881',
    onSecondaryContainer: '#C8E6FF',
    
    // Surface hierarchy for dark mode
    surface: '#1D1B20',
    onSurface: '#E6E0E9',
    surfaceVariant: '#49454F',
    
    // Background for dark mode
    background: '#141218',
    onBackground: '#E6E0E9',
    
    // Custom app colors (including onSurfaceVariant override)
    ...customColors.dark,
  },
};

export type Theme = typeof lightTheme;

// Theme-aware utility functions
export const getThemeColors = (isDark: boolean) => isDark ? darkTheme.colors : lightTheme.colors;

// Helper function to get financial colors based on debt type and theme
export const getDebtColors = (type: 'gave' | 'got', isDark: boolean) => {
  const colors = getThemeColors(isDark);
  if (type === 'gave') {
    return {
      color: colors.credit,
      backgroundColor: colors.creditContainer,
      onContainer: colors.creditOnContainer,
    };
  } else {
    return {
      color: colors.debt,
      backgroundColor: colors.debtContainer, 
      onContainer: colors.debtOnContainer,
    };
  }
};

// Helper function to get status colors with MD3 approach
export const getStatusColors = (status: 'paid' | 'pending' | 'overdue' | undefined, isDark: boolean) => {
  const colors = getThemeColors(isDark);
  switch (status) {
    case 'paid':
      return { 
        color: colors.paid, 
        backgroundColor: colors.paidContainer,
        onContainer: colors.creditOnContainer 
      };
    case 'overdue':
      return { 
        color: colors.overdue, 
        backgroundColor: colors.overdueContainer,
        onContainer: colors.debtOnContainer
      };
    case 'pending':
    default:
      return { 
        color: colors.pending, 
        backgroundColor: colors.pendingContainer,
        onContainer: isDark ? '#FFF3E0' : '#E65100'
      };
  }
};
