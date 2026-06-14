const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const sqliteRoot = path.resolve(__dirname, 'node_modules', 'expo-sqlite');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // For native: redirect expo-sqlite to the original ESM file
  // (Metro uses Babel to transform it, so extension-less imports work fine)
  if (moduleName === 'expo-sqlite' && platform !== 'web') {
    return {
      filePath: path.join(sqliteRoot, 'build', 'index.metro.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
