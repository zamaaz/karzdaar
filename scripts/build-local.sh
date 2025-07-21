#!/bin/bash
# Local Android Build Script
# This builds the APK locally without EAS

echo "🔨 Starting local Android build..."
echo ""

# Check if Android project exists
if [ ! -d "android" ]; then
    echo "❌ Android directory not found. Running prebuild..."
    npx expo prebuild --platform android --clean
    echo "✅ Android project created"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Gradle wrapper exists
if [ ! -f "android/gradlew" ]; then
    echo "❌ Gradle wrapper not found!"
    exit 1
fi

# Make gradlew executable
chmod +x android/gradlew

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build release APK
echo "🚀 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "📱 APK Location:"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "📊 APK Info:"
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo "   Size: $APK_SIZE"
        echo "   Path: $(pwd)/$APK_PATH"
    fi
    echo ""
    echo "🎉 Ready to install and test!"
else
    echo ""
    echo "❌ BUILD FAILED!"
    echo "Check the error messages above for details."
    exit 1
fi
