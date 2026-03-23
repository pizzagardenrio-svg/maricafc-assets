const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Permite ler arquivos .cjs do Firebase
config.resolver.sourceExts.push('cjs');

// 2. ADICIONA SUPORTE A VÍDEO (Crucial para o intro.mp4 rodar)
config.resolver.assetExts.push('mp4');

// 3. SOLUÇÃO SDK 54: Mantém compatibilidade com Firebase Auth
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
