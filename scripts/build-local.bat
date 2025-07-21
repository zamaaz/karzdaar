@echo off
REM Local Android Build Script for Windows
REM This builds the APK locally without EAS

echo 🔨 Starting local Android build...
echo.

REM Check if Android project exists
if not exist "android" (
    echo ❌ Android directory not found. Running prebuild...
    npx expo prebuild --platform android --clean
    echo ✅ Android project created
    echo.
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if Gradle wrapper exists
if not exist "android\gradlew.bat" (
    echo ❌ Gradle wrapper not found!
    pause
    exit /b 1
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
cd android
call gradlew.bat clean

REM Build release APK
echo 🚀 Building release APK...
call gradlew.bat assembleRelease

REM Check if build was successful
if %errorlevel% equ 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo 📱 APK Location:
    echo    android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo 📊 APK Info:
    set APK_PATH=app\build\outputs\apk\release\app-release.apk
    if exist "%APK_PATH%" (
        for %%I in ("%APK_PATH%") do echo    Size: %%~zI bytes
        echo    Path: %cd%\%APK_PATH%
    )
    echo.
    echo 🎉 Ready to install and test!
) else (
    echo.
    echo ❌ BUILD FAILED!
    echo Check the error messages above for details.
    pause
    exit /b 1
)

cd ..
pause
