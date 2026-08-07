const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite still statically bundles its wa-sqlite web module (including the
// .wasm binary) for the web platform even though src/services/database.ts skips
// calling it on web — Metro needs to know how to bundle the asset regardless.
config.resolver.assetExts.push('wasm');

module.exports = config;
