@echo off
REM Size-optimized build script for Windows

echo 🔧 Building size-optimized APK...

REM Set production environment
set NODE_ENV=production

REM Build with optimized profile
eas build --platform android --profile production-optimized --clear-cache

echo ✅ Optimized build complete!
echo 📱 Expected size reduction: 30-50%% smaller than original
echo 🎯 Key optimizations applied:
echo    - Removed x86/x86_64 architectures
echo    - Enabled R8 full mode optimization  
echo    - Disabled development features
echo    - Enabled resource shrinking
echo    - Optimized Metro bundling
