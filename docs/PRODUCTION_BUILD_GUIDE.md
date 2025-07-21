# Production APK Build Instructions

## Prerequisites

### 1. Install Java Development Kit (JDK)

Download and install JDK 17 or higher:
- **Windows**: https://adoptium.net/temurin/releases/
- **Alternative**: Use Scoop: `scoop install openjdk17`
- **Alternative**: Use Chocolatey: `choco install openjdk17`

After installation, verify with:
```bash
java -version
javac -version
```

### 2. Set Environment Variables

Add to your system PATH:
```
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot
PATH=%JAVA_HOME%\bin;%PATH%
```

## Building Production APK

### Option 1: Using Build Script (Recommended)
```bash
# Windows
build-production.bat

# Linux/Mac
./build-production.sh
```

### Option 2: Manual Build
```bash
# Clean previous builds
cd android
./gradlew clean

# Build production APK
./gradlew assembleRelease
```

### Option 3: Using EAS Build (Cloud-based)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile production
```

## APK Location

After successful build, find your APK at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Production Features Enabled

✅ **Security & Optimization**
- Code obfuscation with ProGuard/R8
- Resource shrinking and compression
- Dead code elimination
- PNG optimization
- Minimal permissions

✅ **Play Protect Compliance**
- Proper APK signing
- Standard Android structure
- No suspicious code patterns
- Optimized bytecode
- Clean manifest

✅ **Performance**
- Hermes JavaScript engine
- Native code optimization
- Bundle compression
- Asset optimization

## Testing Checklist

Before distribution:

1. **Install on test devices**
   - Test on different Android versions
   - Verify all features work correctly
   - Check app permissions

2. **Security verification**
   - No Play Protect warnings
   - Smooth installation process
   - Proper app behavior

3. **Performance testing**
   - App startup time
   - Memory usage
   - Battery consumption

## Distribution Options

### Direct Installation
- Share APK file directly
- Enable "Unknown sources" on target devices
- Users can install via file manager

### Internal Testing
- Upload to Google Play Console
- Add testers via email
- Test before public release

### APK Distribution Platforms
- Firebase App Distribution
- TestFlight (for iOS)
- Custom distribution server

## Troubleshooting

### Build Errors
- Ensure Java 17+ is installed
- Check ANDROID_HOME environment variable
- Clear node_modules and reinstall
- Run `npx expo doctor` for diagnostics

### Installation Issues
- Check device compatibility (minSdkVersion: 23+)
- Verify APK signature
- Clear cache and retry installation

### Play Protect Warnings
- Our APK is configured to avoid these issues
- Use proper signing certificates
- Test on multiple devices before distribution

## Security Best Practices

1. **Always use production builds** for distribution
2. **Keep dependencies updated** for security patches
3. **Use proper signing certificates** for releases
4. **Test thoroughly** before public distribution
5. **Monitor app behavior** post-release
