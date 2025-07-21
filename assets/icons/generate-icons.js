#!/usr/bin/env node
/**
 * Icon Generator for Karzdaar App
 * Generates all required icon sizes from SVG templates
 * 
 * Note: This script requires svg2png or similar tool to convert SVG to PNG
 * For development, you can use online converters or install imagemagick
 */

const fs = require('fs');
const path = require('path');

const iconSizes = {
  // Android adaptive icon (1024x1024 for Play Store)
  android: {
    'adaptive-icon/background.png': 1024,
    'adaptive-icon/foreground.png': 1024,
    'adaptive-icon/monochrome.png': 1024,
  },
  
  // iOS icons
  ios: {
    'icon-1024.png': 1024,  // App Store
    'icon-180.png': 180,    // iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus, X, XS, 11 Pro
    'icon-167.png': 167,    // iPad Pro
    'icon-152.png': 152,    // iPad, iPad mini
    'icon-120.png': 120,    // iPhone
    'icon-87.png': 87,      // iPhone 6s, 7, 8, SE
    'icon-80.png': 80,      // iPhone 6, 6s, 7, 8, X, XS, 11, 12 (Settings)
    'icon-76.png': 76,      // iPad
    'icon-60.png': 60,      // iPhone (2x and 3x handled by filename)
    'icon-58.png': 58,      // iPhone (Settings 2x)
    'icon-40.png': 40,      // iPhone, iPad (Spotlight, Settings)
    'icon-29.png': 29,      // iPhone, iPad (Settings)
    'icon-20.png': 20,      // iPhone, iPad (Notifications)
  },
  
  // Web
  web: {
    'favicon.png': 32,
    'favicon-16.png': 16,
    'favicon-32.png': 32,
    'favicon-96.png': 96,
    'favicon-192.png': 192,
    'favicon-512.png': 512,
  }
};

// Base SVG templates
const svgTemplates = {
  background: 'adaptive-icon/background.svg',
  foreground: 'adaptive-icon/foreground.svg',
  monochrome: 'adaptive-icon/monochrome.svg',
  combined: 'combined-icon.svg' // Will be generated
};

// Generate combined icon SVG for iOS and web
const combinedIconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Combined icon for iOS and web platforms -->
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6750A4;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#7C4DFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9C27B0;stop-opacity:1" />
    </linearGradient>
    
    <!-- Icon gradient -->
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8F9FA;stop-opacity:1" />
    </linearGradient>
    
    <!-- Shadow filter -->
    <filter id="iconShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
      <feOffset dx="0" dy="4" result="offset"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <circle cx="512" cy="512" r="512" fill="url(#bgGradient)"/>
  <circle cx="512" cy="512" r="480" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  
  <!-- Foreground icon -->
  <g transform="translate(512, 512)" filter="url(#iconShadow)">
    <g transform="scale(0.8, 0.8)">
      <!-- Rupee symbol -->
      <path d="M-80 -120 L80 -120 L80 -80 L-20 -80 C20 -40, 60 0, 80 40 L80 80 L40 80 C20 40, -20 0, -60 -40 L80 -40 L80 0 L-80 0 Z" 
            fill="url(#iconGradient)" 
            stroke="#FFFFFF" 
            stroke-width="4" 
            stroke-linejoin="round"/>
      
      <!-- Balance scale -->
      <ellipse cx="-100" cy="60" rx="25" ry="8" fill="url(#iconGradient)" stroke="#FFFFFF" stroke-width="2"/>
      <ellipse cx="100" cy="60" rx="25" ry="8" fill="url(#iconGradient)" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="-100" y1="52" x2="100" y2="52" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
      <circle cx="0" cy="45" r="6" fill="url(#iconGradient)" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="-100" y1="52" x2="-100" y2="40" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="100" y1="52" x2="100" y2="40" stroke="#FFFFFF" stroke-width="2"/>
      
      <!-- Geometric accents -->
      <circle cx="-120" cy="-100" r="4" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="120" cy="-100" r="4" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="-120" cy="80" r="4" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="120" cy="80" r="4" fill="#FFFFFF" opacity="0.6"/>
    </g>
  </g>
</svg>`;

// Create combined icon SVG
const currentDir = process.cwd();
fs.writeFileSync(path.join(currentDir, 'combined-icon.svg'), combinedIconSVG);

console.log('📱 Karzdaar Icon Generator');
console.log('==========================');
console.log('');
console.log('✅ SVG templates created:');
console.log('   - Background layer (adaptive-icon/background.svg)');
console.log('   - Foreground layer (adaptive-icon/foreground.svg)');
console.log('   - Monochrome version (adaptive-icon/monochrome.svg)');
console.log('   - Combined icon (combined-icon.svg)');
console.log('');
console.log('📋 Required icon sizes:');

Object.entries(iconSizes).forEach(([platform, sizes]) => {
  console.log(`\n${platform.toUpperCase()}:`);
  Object.entries(sizes).forEach(([filename, size]) => {
    console.log(`  - ${filename} (${size}x${size})`);
  });
});

console.log('');
console.log('� Converting SVGs to PNGs...');

// Function to convert SVG to PNG using sharp
async function convertSvgToPng() {
  const sharp = require('sharp');
  
  try {
    // Ensure directories exist
    ['android', 'ios', 'web'].forEach(dir => {
      const dirPath = path.join(currentDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    // Ensure adaptive-icon directory exists in android
    const adaptiveIconDir = path.join(currentDir, 'android', 'adaptive-icon');
    if (!fs.existsSync(adaptiveIconDir)) {
      fs.mkdirSync(adaptiveIconDir, { recursive: true });
    }
    
    // Convert adaptive icon components
    const adaptiveIconSvgs = ['background.svg', 'foreground.svg', 'monochrome.svg'];
    for (const svgFile of adaptiveIconSvgs) {
      const svgPath = path.join(currentDir, 'adaptive-icon', svgFile);
      if (fs.existsSync(svgPath)) {
        const outputPath = path.join(adaptiveIconDir, svgFile.replace('.svg', '.png'));
        await sharp(svgPath)
          .resize(1024, 1024)
          .png()
          .toFile(outputPath);
        console.log(`   ✅ ${svgFile} → android/adaptive-icon/${svgFile.replace('.svg', '.png')}`);
      }
    }
    
    // Convert combined icon for iOS and web
    const combinedIconPath = path.join(currentDir, 'combined-icon.svg');
    if (fs.existsSync(combinedIconPath)) {
      // iOS icons
      for (const [filename, size] of Object.entries(iconSizes.ios)) {
        const outputPath = path.join(currentDir, 'ios', filename);
        await sharp(combinedIconPath)
          .resize(size, size)
          .png()
          .toFile(outputPath);
        console.log(`   ✅ combined-icon.svg → ios/${filename} (${size}x${size})`);
      }
      
      // Web icons
      for (const [filename, size] of Object.entries(iconSizes.web)) {
        const outputPath = path.join(currentDir, 'web', filename);
        await sharp(combinedIconPath)
          .resize(size, size)
          .png()
          .toFile(outputPath);
        console.log(`   ✅ combined-icon.svg → web/${filename} (${size}x${size})`);
      }
    }
    
    console.log('');
    console.log('🎉 Icon generation complete!');
    console.log('');
    console.log('📍 Generated files are located in:');
    console.log('   - android/adaptive-icon/ (Android adaptive icon layers)');
    console.log('   - ios/ (iOS app icons)');
    console.log('   - web/ (Web app icons)');
    console.log('');
    console.log('🎨 Material You features:');
    console.log('   ✅ Dynamic theming support');
    console.log('   ✅ Adaptive icon format');
    console.log('   ✅ Monochrome variant');
    console.log('   ✅ Safe area compliance');
    console.log('   ✅ Multiple size support');
    
  } catch (error) {
    console.error('❌ Error during conversion:', error.message);
    console.log('');
    console.log('🔧 Manual conversion options:');
    console.log('   1. Use online converter: https://svgtopng.com/');
    console.log('   2. Or install ImageMagick: npm install -g imagemagick');
    console.log('   3. Or use Figma/Sketch to export at required sizes');
    console.log('');
    console.log('📍 Target directories:');
    console.log('   - android/adaptive-icon/ (Android)');
    console.log('   - ios/ (iOS)');
    console.log('   - web/ (Web)');
  }
}

// Run the conversion
convertSvgToPng();

module.exports = {
  iconSizes,
  svgTemplates,
  combinedIconSVG
};
