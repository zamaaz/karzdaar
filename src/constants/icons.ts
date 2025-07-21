import { useTheme } from 'react-native-paper';

/**
 * Material You color tokens for icons based on usage context
 * These ensure proper contrast and semantic meaning
 */
export const useIconColors = () => {
  const theme = useTheme();
  
  return {
    // Primary actions and important elements
    primary: theme.colors.onSurface,
    primaryContainer: theme.colors.onPrimaryContainer,
    
    // Secondary actions and supporting elements
    secondary: theme.colors.onSurfaceVariant,
    secondaryContainer: theme.colors.onSecondaryContainer,
    
    // Interactive elements
    interactive: theme.colors.primary,
    interactivePressed: theme.colors.onPrimary,
    
    // Status indicators
    success: theme.colors.primary, // Using primary as success in Material 3
    warning: theme.colors.tertiary,
    error: theme.colors.error,
    
    // Navigation and system
    navigation: theme.colors.onSurface,
    disabled: theme.colors.outline,
    
    // Background variants
    onSurface: theme.colors.onSurface,
    onSurfaceVariant: theme.colors.onSurfaceVariant,
    onBackground: theme.colors.onBackground,
    
    // Specific contexts
    floating: theme.colors.onPrimary, // For FABs
    appBar: theme.colors.onSurface,
    card: theme.colors.onSurface,
    list: theme.colors.onSurface,
  };
};

/**
 * Icon size tokens following Material 3 guidelines
 */
export const iconSizes = {
  small: 16,    // Inline with text, secondary actions
  medium: 24,   // Default for most UI elements
  large: 32,    // Prominent actions, headers
  extraLarge: 48, // Hero elements, empty states
  huge: 64,     // Splash screens, major features
} as const;

/**
 * Semantic icon mapping for semantic consistency
 * Using outline/unfilled icons for better visual appearance
 * This ensures we use the most appropriate Material icon for each context
 */
export const semanticIcons = {
  // Navigation
  home: 'home-outline',
  back: 'arrow-left',
  forward: 'arrow-right',
  close: 'close',
  menu: 'menu',
  settings: 'cog-outline',
  search: 'magnify',
  filter: 'filter-variant',
  
  // Actions
  add: 'plus',
  create: 'plus',
  edit: 'pencil-outline',
  delete: 'delete-outline',
  save: 'content-save-outline',
  copy: 'content-copy',
  share: 'share-variant-outline',
  download: 'download-outline',
  upload: 'upload-outline',
  refresh: 'refresh',
  sync: 'sync',
  
  // User & Account
  person: 'account-outline',
  personAdd: 'account-plus-outline',
  personRemove: 'account-minus-outline',
  group: 'account-group-outline',
  profile: 'account-circle-outline',
  
  // Financial & Business
  money: 'currency-inr',
  wallet: 'wallet-outline',
  payment: 'credit-card-outline',
  receipt: 'receipt-outline',
  invoice: 'file-document-outline',
  calculator: 'calculator',
  chart: 'chart-line',
  
  // Security & Privacy
  lock: 'lock-outline',
  unlock: 'lock-open-outline',
  fingerprint: 'fingerprint',
  shield: 'shield-check-outline',
  privacy: 'shield-check-outline',
  security: 'shield-lock-outline',
  visible: 'eye-outline',
  hidden: 'eye-off-outline',
  
  // Communication
  email: 'email-outline',
  phone: 'phone-outline',
  message: 'message-text-outline',
  chat: 'chat-outline',
  notification: 'bell-outline',
  notificationOff: 'bell-off-outline',
  
  // Theme & Display
  lightMode: 'white-balance-sunny',
  darkMode: 'weather-night',
  autoMode: 'theme-light-dark',
  brightness: 'brightness-6',
  
  // Status & Feedback
  success: 'check-circle-outline',
  error: 'alert-circle-outline',
  warning: 'alert-outline',
  info: 'information-outline',
  help: 'help-circle-outline',
  
  // Time & Date
  calendar: 'calendar-outline',
  clock: 'clock-outline',
  history: 'history',
  schedule: 'calendar-clock-outline',
  
  // Documents & Data
  document: 'file-document-outline',
  folder: 'folder-outline',
  file: 'file-outline',
  image: 'image-outline',
  
  // Media & Content
  play: 'play-outline',
  pause: 'pause',
  stop: 'stop',
  volume: 'volume-high',
  volumeOff: 'volume-off',
  
  // System & Technical
  database: 'database-outline',
  server: 'server',
  cloud: 'cloud-outline',
  cloudOff: 'cloud-off-outline',
  wifi: 'wifi',
  wifiOff: 'wifi-off',
  bluetooth: 'bluetooth',
  
  // Social & External
  github: 'github',
  website: 'web',
  link: 'link-variant',
  externalLink: 'open-in-new',
  
  // UI Elements
  more: 'dots-vertical',
  moreHorizontal: 'dots-horizontal',
  chevronUp: 'chevron-up',
  chevronDown: 'chevron-down',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',
  expand: 'chevron-down',
  collapse: 'chevron-up',
  
  // States
  favorite: 'heart-outline',
  favoriteOutline: 'heart-outline',
  star: 'star-outline',
  starOutline: 'star-outline',
  bookmark: 'bookmark-outline',
  bookmarkOutline: 'bookmark-outline',
  
  // Tools & Utilities
  tools: 'tools',
  wrench: 'wrench',
  screwdriver: 'screwdriver',
  hammer: 'hammer',
  
} as const;

export type SemanticIconName = keyof typeof semanticIcons;
