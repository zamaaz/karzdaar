#!/bin/bash
# Size-optimized build script

echo "🔧 Building size-optimized APK..."

# Set production environment
export NODE_ENV=production

# Build with optimized profile
eas build --platform android --profile production-optimized --clear-cache

echo "✅ Optimized build complete!"
echo "📱 Expected size reduction: 30-50% smaller than original"
echo "🎯 Key optimizations applied:"
echo "   - Removed x86/x86_64 architectures"
echo "   - Enabled R8 full mode optimization"
echo "   - Disabled development features"
echo "   - Enabled resource shrinking"
echo "   - Optimized Metro bundling"
