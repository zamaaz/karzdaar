import React from 'react';
import { FAB as PaperFAB, FABProps as PaperFABProps, useTheme } from 'react-native-paper';
import { semanticIcons, SemanticIconName } from '@/src/constants/icons';

interface ThemedFABProps extends Omit<PaperFABProps, 'icon' | 'size'> {
  /** Semantic icon name for consistent theming */
  icon: SemanticIconName | string;
  /** FAB size following Material 3 guidelines */
  size?: 'small' | 'medium' | 'large';
  /** Color variant for automatic theme adaptation */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
}

/**
 * Material You compliant FAB that automatically adapts to theme
 * and uses semantic icon naming for consistency across the app.
 */
export function ThemedFAB({
  icon,
  size = 'medium',
  variant = 'primary',
  style,
  ...props
}: ThemedFABProps) {
  const theme = useTheme();
  
  // Get semantic icon name if available, otherwise use the provided icon
  const iconName = (icon in semanticIcons) ? semanticIcons[icon as SemanticIconName] : icon;
  
  // Calculate size and colors based on variant
  const fabSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';
  
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          color: theme.colors.onSecondary,
        };
      case 'tertiary':
        return {
          backgroundColor: theme.colors.tertiary,
          color: theme.colors.onTertiary,
        };
      case 'surface':
        return {
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <PaperFAB
      {...props}
      icon={iconName}
      size={fabSize}
      style={[
        {
          backgroundColor: colors.backgroundColor,
        },
        style,
      ]}
      color={colors.color}
    />
  );
}
