import React from 'react';
import { List, useTheme } from 'react-native-paper';
import { semanticIcons, SemanticIconName } from '@/src/constants/icons';

interface ThemedListIconProps {
  /** Semantic icon name for consistent theming */
  icon: SemanticIconName | string;
  /** Color context for automatic theme adaptation */
  colorContext?: 'primary' | 'secondary' | 'onSurface' | 'onSurfaceVariant';
  /** Override automatic color selection */
  color?: string;
}

/**
 * Material You compliant List.Icon that automatically adapts to theme
 * and uses semantic icon naming for consistency across the app.
 */
export function ThemedListIcon({
  icon,
  colorContext = 'onSurface',
  color,
  ...props
}: ThemedListIconProps & React.ComponentProps<typeof List.Icon>) {
  const theme = useTheme();
  
  // Get semantic icon name if available, otherwise use the provided icon
  const iconName = (icon in semanticIcons) ? semanticIcons[icon as SemanticIconName] : icon;
  
  // Get color based on context
  const iconColor = color || (() => {
    switch (colorContext) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'onSurface': return theme.colors.onSurface;
      case 'onSurfaceVariant': return theme.colors.onSurfaceVariant;
      default: return theme.colors.onSurface;
    }
  })();
  
  return (
    <List.Icon
      {...props}
      icon={iconName}
      color={iconColor}
    />
  );
}
