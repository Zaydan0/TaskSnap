// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Allow .cjs, .mjs, and native.js files to be resolved
  config.resolver.sourceExts = [
    ...config.resolver.sourceExts,
    'cjs',
    'mjs',
    'native.js',
  ];

  // Whenever someone does `import ... from 'firebase/auth/react-native'`,
  // Metro will load our stub instead.
  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    'firebase/auth/react-native': path.resolve(__dirname, 'rn-auth-stub.js'),
  };

  return config;
})();
