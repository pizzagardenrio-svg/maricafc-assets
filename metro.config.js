const { getDefaultConfig } = require('@expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

// 1. Permite ler arquivos .cjs do Firebase
defaultConfig.resolver.sourceExts.push('cjs');

// 2. SOLUÇÃO FINAL: Desativa exportações instáveis que quebram o Firebase Auth no SDK 54
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
