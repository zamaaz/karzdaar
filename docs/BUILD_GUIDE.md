# Build Configuration for Production APK

## Security Measures to Avoid Play Protect Issues

### 1. Proper App Signing
- Using EAS Build for consistent signing
- Production keystore management
- ProGuard/R8 code obfuscation

### 2. Metadata Configuration
- Proper app description and category
- Valid permissions declarations
- Intent filters for deep linking

### 3. Code Quality
- Minification enabled
- Dead code elimination
- Asset optimization

## Build Commands

### Development Build (for testing)
```bash
eas build --platform android --profile preview
```

### Production Build (for distribution)
```bash
eas build --platform android --profile production
```

### Production AAB (for Google Play Store)
```bash
eas build --platform android --profile production-aab
```

## Pre-build Checklist

- [ ] App metadata is complete
- [ ] Icons are properly sized
- [ ] Permissions are minimal and justified
- [ ] Deep linking is configured
- [ ] Build profiles are set up
- [ ] Code is minified
- [ ] Assets are optimized

## Post-build Security

1. **Test on multiple devices** before distribution
2. **Use internal testing** before public release
3. **Monitor Play Console** for security warnings
4. **Keep dependencies updated** for security patches
5. **Use proper versioning** for updates
