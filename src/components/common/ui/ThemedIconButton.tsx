import React from 'react';
import { IconButton as PaperIconButton, IconButtonProps as PaperIconButtonProps } from 'react-native-paper';
import { useIconColors, semanticIcons, SemanticIconName, iconSizes } from '@/src/constants/icons';

interface ThemedIconButtonProps extends Omit<PaperIconButtonProps, 'icon' | 'iconColor' | 'size'> {
  /** Semantic icon name for consistent theming */
  icon: SemanticIconName | string;
  /** Icon size following Material 3 guidelines */
  size?: keyof typeof iconSizes | number;
  /** Color context for automatic theme adaptation */
  colorContext?: 'primary' | 'secondary' | 'interactive' | 'navigation' | 'error' | 'success' | 'warning';
  /** Override automatic color selection */
  iconColor?: string;
}

/**
 * Material You compliant IconButton that automatically adapts to theme
 * and uses semantic icon naming for consistency across the app.
 */
export function ThemedIconButton({
  icon,
  size = 'medium',
  colorContext = 'navigation',
  iconColor,
  ...props
}: ThemedIconButtonProps) {
  const iconColors = useIconColors();
  
  // Get semantic icon name if available, otherwise use the provided icon
  const iconName = (icon in semanticIcons) ? semanticIcons[icon as SemanticIconName] : icon;
  
  // Calculate size
  const iconSize = typeof size === 'number' ? size : iconSizes[size];
  
  // Get color based on context
  const resolvedIconColor = iconColor || (() => {
    switch (colorContext) {
      case 'primary': return iconColors.primary;
      case 'secondary': return iconColors.secondary;
      case 'interactive': return iconColors.interactive;
      case 'navigation': return iconColors.navigation;
      case 'error': return iconColors.error;
      case 'success': return iconColors.success;
      case 'warning': return iconColors.warning;
      default: return iconColors.navigation;
    }
  })();
  
  return (
    <PaperIconButton
      {...props}
      icon={iconName}
      size={iconSize}
      iconColor={resolvedIconColor}
    />
  );
}
