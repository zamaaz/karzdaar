const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize bundle size
config.transformer.minifierConfig = {
  // Remove dead code
  deadCodeElimination: true,
  // Keep function names for better debugging
  keepFnName: false,
  // Mangle property names to reduce size
  mangle: {
    properties: {
      regex: /^_/,
    },
  },
};

// Enable tree shaking
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
