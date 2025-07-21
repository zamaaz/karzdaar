# Material You Adaptive Icon Implementation

## Quick Setup Guide

The SVG templates have been created for the Karzdaar Material You adaptive icon. To complete the setup:

### 1. Convert SVG to PNG (Required for immediate use)

Use one of these methods to convert the SVG files to PNG:

**Option A: Online Converter (Easiest)**
1. Go to https://svgtopng.com/
2. Upload each SVG file from `assets/icons/`
3. Set size to 1024x1024 for adaptive icon files
4. Download and place in correct directories

**Option B: Using ImageMagick**
```bash
npm install -g imagemagick
convert assets/icons/combined-icon.svg -resize 1024x1024 assets/images/icon.png
convert assets/icons/adaptive-icon/background.svg -resize 1024x1024 assets/images/adaptive-icon.png
```

**Option C: Using Figma/Sketch**
1. Import SVG files
2. Export at required sizes
3. Save to appropriate directories

### 2. Temporary Fallback

For immediate testing, the app will fallback to the existing icons in `assets/images/` until proper PNG versions are generated.

### 3. File Structure After Conversion

```
assets/
├── icons/
│   ├── adaptive-icon/
│   │   ├── background.png (1024x1024)
│   │   ├── foreground.png (1024x1024)
│   │   └── monochrome.png (1024x1024)
│   ├── ios/
│   │   └── icon-1024.png
│   └── web/
│       └── favicon.png
└── images/ (existing fallback icons)
    ├── icon.png
    └── adaptive-icon.png
```

### 4. Material You Features

✅ **Dynamic Theming**: Icon adapts to user's wallpaper colors on Android 13+
✅ **Adaptive Format**: Separate background/foreground layers
✅ **Monochrome Support**: For themed scenarios
✅ **Multiple Platforms**: iOS, Android, Web support
✅ **Safe Area Compliance**: Icon elements within safe zones

### 5. Testing

Once PNG files are generated:
1. Restart Expo development server
2. Test on Android 13+ device for Material You theming
3. Verify icon appears correctly in launcher
4. Test splash screen appearance

The icon will automatically adapt to the user's Material You color palette on supported devices while maintaining brand identity.
