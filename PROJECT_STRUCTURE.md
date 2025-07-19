# Karzdaar Project Structure

## Overview
This Expo app follows a clean, scalable architecture with a well-organized `src/` directory structure.

## Tech Stack
- **React Native** with **Expo Router** (file-based routing)
- **React Native Paper** for UI components
- **React Navigation** for navigation
- **AsyncStorage** for local storage
- **TypeScript** for type safety

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (LoadingSpinner, EmptyState)
│   ├── common/         # Common components (ScreenLayout, Headers)
│   └── forms/          # Form-specific components
├── screens/            # Screen components (HomeScreen, ExploreScreen)
├── navigation/         # Navigation configuration (if needed)
├── services/           # API calls and external services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions (storage, helpers)
├── types/              # TypeScript type definitions
├── constants/          # App constants, themes, storage keys
└── store/              # State management (when needed)

app/                    # Expo Router file-based routing
assets/                 # Static assets (images, fonts)
```

## Key Features

### Theme Support
- Material Design 3 themes with React Native Paper
- Light/Dark mode with persistent storage
- Custom color schemes in `src/constants/theme.ts`

### Custom Hooks
- `useColorScheme()` - Enhanced theme management with persistence

### Utilities
- Storage utilities for AsyncStorage
- Helper functions for common operations
- Type-safe API service class

### Components
- `ScreenLayout` - Consistent screen wrapper
- `LoadingSpinner` - Standardized loading states
- `EmptyState` - User-friendly empty states

## Getting Started

1. **Development**: `npm start`
2. **Add new screens**: Create in `src/screens/` and export from `index.ts`
3. **Add components**: Create in appropriate `src/components/` subdirectory
4. **Configure theme**: Edit `src/constants/theme.ts`
5. **Add API services**: Extend `src/services/api.ts`

## Best Practices

- Export all modules through `index.ts` files for clean imports
- Use TypeScript types defined in `src/types/`
- Follow the established component patterns
- Keep screens lightweight, move logic to hooks or services
- Use React Native Paper components for consistency
