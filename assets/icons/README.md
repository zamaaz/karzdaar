# Karzdaar - Material You Adaptive App Icon

This directory contains the Material You adaptive app icon for Karzdaar, following Android 13+ Material Design guidelines.

## Icon Design

The Karzdaar icon represents debt/credit management with:
- **Background**: Clean Material You themed gradient
- **Foreground**: Stylized rupee symbol with geometric balance scale elements
- **Shape**: Following Material You adaptive icon guidelines
- **Dynamic theming**: Adapts to user's Material You palette on Android 13+

## File Structure

```
assets/icons/
├── adaptive-icon/
│   ├── background.png          # Background layer (1024x1024)
│   ├── foreground.png          # Foreground layer (1024x1024)
│   └── monochrome.png          # Monochrome version for themed icons
├── ios/
│   ├── icon-1024.png           # iOS App Store icon
│   ├── icon-180.png            # iPhone icon
│   └── icon-167.png            # iPad icon
└── web/
    └── favicon.png             # Web favicon
```

## Material You Compliance

✅ **Shape & Proportion**: Follows Material You adaptive icon keylines
✅ **Color Layering**: Separate background and foreground layers
✅ **Dynamic Theming**: Adapts to user's Material You palette
✅ **Safe Area**: Important elements within the safe zone
✅ **Shadow & Depth**: Proper elevation and depth cues
✅ **Scalability**: Crisp at all sizes from 16px to 1024px

## Dynamic Theming

On Android 13+ devices with Material You:
- Background adapts to user's wallpaper-based color palette
- Foreground maintains brand identity while respecting user colors
- Monochrome version used for themed scenarios

On older devices:
- Fallback to brand colors (primary purple/teal theme)
- Maintains visual consistency across all Android versions

## Implementation

The icon system integrates with:
- Expo's asset system for automatic resizing
- expo-splash-screen for consistent branding
- expo-dev-client for development builds
- Material You system colors on supported devices
