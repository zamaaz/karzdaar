# PowerShell Local Build Script
Write-Host "🔨 Starting local Android build..." -ForegroundColor Green
Write-Host ""

# Set Java environment (adjust path if needed)
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.13.11-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Verify Java is available
Write-Host "☕ Checking Java installation..."
try {
    $javaVersion = & java -version 2>&1
    Write-Host "✅ Java found: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found! Please check JAVA_HOME." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if Android project exists
if (-not (Test-Path "android")) {
    Write-Host "❌ Android directory not found. Running prebuild..." -ForegroundColor Yellow
    npx expo prebuild --platform android --clean
    Write-Host "✅ Android project created" -ForegroundColor Green
    Write-Host ""
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Navigate to android directory
Set-Location android

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
& .\gradlew.bat clean

# Build release APK
Write-Host "🚀 Building release APK..." -ForegroundColor Magenta
& .\gradlew.bat assembleRelease

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 APK Location:" -ForegroundColor Cyan
    Write-Host "   android\app\build\outputs\apk\release\app-release.apk"
    Write-Host ""
    
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length
        $apkSizeMB = [math]::Round($apkSize / 1MB, 2)
        Write-Host "📊 APK Info:" -ForegroundColor Yellow
        Write-Host "   Size: $apkSizeMB MB ($apkSize bytes)"
        Write-Host "   Path: $(Get-Location)\$apkPath"
    }
    Write-Host ""
    Write-Host "🎉 Ready to install and test!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Check the error messages above for details."
    exit 1
}

# Return to project root
Set-Location ..
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
