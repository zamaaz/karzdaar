import React from 'react';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

export type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface MaterialIconProps {
  name: MaterialIconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  themeColor?: 'primary' | 'secondary' | 'tertiary' | 'onSurface' | 'onSurfaceVariant' | 'onPrimary' | 'onSecondary' | 'onTertiary' | 'error' | 'onError';
}

/**
 * Material You compliant icon component that uses Material Design icons
 * and adapts to the current theme colors automatically.
 * 
 * Uses Material Community Icons from @expo/vector-icons which follows
 * Material Design 3 icon guidelines.
 */
export function MaterialIcon({
  name,
  size = 24,
  color,
  style,
  themeColor = 'onSurface',
}: MaterialIconProps) {
  const theme = useTheme();
  
  // Use theme color if no explicit color is provided
  const iconColor = color || theme.colors[themeColor];
  
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={iconColor}
      style={style}
    />
  );
}

/**
 * Predefined Material You icon mappings for common use cases
 * These follow Material 3 design principles and semantic meanings
 */
export const MaterialIconMappings = {
  // Navigation
  home: 'home' as MaterialIconName,
  settings: 'cog' as MaterialIconName,
  back: 'arrow-left' as MaterialIconName,
  forward: 'arrow-right' as MaterialIconName,
  close: 'close' as MaterialIconName,
  menu: 'menu' as MaterialIconName,
  
  // Actions
  add: 'plus' as MaterialIconName,
  edit: 'pencil' as MaterialIconName,
  delete: 'delete' as MaterialIconName,
  save: 'content-save' as MaterialIconName,
  share: 'share-variant' as MaterialIconName,
  search: 'magnify' as MaterialIconName,
  filter: 'filter-variant' as MaterialIconName,
  refresh: 'refresh' as MaterialIconName,
  
  // User & Account
  person: 'account' as MaterialIconName,
  personAdd: 'account-plus' as MaterialIconName,
  personRemove: 'account-minus' as MaterialIconName,
  group: 'account-group' as MaterialIconName,
  
  // Financial
  money: 'currency-inr' as MaterialIconName,
  wallet: 'wallet' as MaterialIconName,
  payment: 'credit-card' as MaterialIconName,
  receipt: 'receipt' as MaterialIconName,
  invoice: 'file-document' as MaterialIconName,
  
  // Security
  lock: 'lock' as MaterialIconName,
  unlock: 'lock-open' as MaterialIconName,
  fingerprint: 'fingerprint' as MaterialIconName,
  shield: 'shield-check' as MaterialIconName,
  visibility: 'eye' as MaterialIconName,
  visibilityOff: 'eye-off' as MaterialIconName,
  
  // Communication
  email: 'email' as MaterialIconName,
  phone: 'phone' as MaterialIconName,
  message: 'message-text' as MaterialIconName,
  notification: 'bell' as MaterialIconName,
  
  // Theme & Display
  lightMode: 'white-balance-sunny' as MaterialIconName,
  darkMode: 'weather-night' as MaterialIconName,
  autoMode: 'theme-light-dark' as MaterialIconName,
  
  // Status & Feedback
  success: 'check-circle' as MaterialIconName,
  error: 'alert-circle' as MaterialIconName,
  warning: 'alert' as MaterialIconName,
  info: 'information' as MaterialIconName,
  
  // Time & Date
  calendar: 'calendar' as MaterialIconName,
  clock: 'clock' as MaterialIconName,
  history: 'history' as MaterialIconName,
  
  // Documents & Data
  document: 'file-document' as MaterialIconName,
  folder: 'folder' as MaterialIconName,
  download: 'download' as MaterialIconName,
  upload: 'upload' as MaterialIconName,
  
  // Help & Support
  help: 'help-circle' as MaterialIconName,
  faq: 'frequently-asked-questions' as MaterialIconName,
  support: 'lifebuoy' as MaterialIconName,
  
  // Social & External
  github: 'github' as MaterialIconName,
  website: 'web' as MaterialIconName,
  
  // System
  database: 'database' as MaterialIconName,
  sync: 'sync' as MaterialIconName,
  offline: 'cloud-off' as MaterialIconName,
  online: 'cloud-check' as MaterialIconName,
} as const;

/**
 * Helper component for commonly used icons with proper Material You styling
 */
interface CommonIconProps extends Omit<MaterialIconProps, 'name'> {
  variant: keyof typeof MaterialIconMappings;
}

export function CommonMaterialIcon({ variant, ...props }: CommonIconProps) {
  return <MaterialIcon name={MaterialIconMappings[variant]} {...props} />;
}
