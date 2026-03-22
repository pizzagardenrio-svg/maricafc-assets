import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

/**
 * firebase.js — Inicialização do Firebase
 *
 * • Lê TODAS as variáveis de ambiente via EXPO_PUBLIC_ (obrigatório para
 *   que funcionem tanto no bundle nativo quanto no build da Vercel).
 * • Usa `browserLocalPersistence` na Web e `SecureStore` no mobile.
 * • O SecureStore é importado dinamicamente para evitar que sua ausência
 *   quebre o build web (expo-secure-store não existe no browser).
 * • Um try/catch envolve toda a inicialização do auth para que um eventual
 *   erro de persistência não deixe o app em tela branca — ele cai para
 *   persistência em memória como fallback.
 */

// ─── Configuração ────────────────────────────────────────────────────────────
// Todas as chaves são lidas via variáveis de ambiente.
// Certifique-se de que estão declaradas no .env (local) e nas
// Environment Variables do projeto na Vercel.
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// ─── App (singleton) ─────────────────────────────────────────────────────────
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ─── Auth ─────────────────────────────────────────────────────────────────────
let auth;

if (Platform.OS === 'web') {
  // Web / Vercel → persiste sessão no localStorage do navegador.
  try {
    auth = initializeAuth(app, { persistence: browserLocalPersistence });
  } catch (e) {
    // initializeAuth lança se já foi chamado (ex.: hot-reload); reutiliza a instância.
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
  }
} else {
  // Mobile (iOS / Android) → persiste sessão no SecureStore do dispositivo.
  // Importação dinâmica garante que o módulo nativo não seja avaliado na Web.
  try {
    const SecureStore = require('expo-secure-store');

    // O Firebase Auth exige que as chaves não contenham caracteres especiais.
    const sanitizeKey = (key) => key.replace(/[^a-zA-Z0-9.-]/g, '_');

    const secureStorePersistence = {
      getItem: async (key) => {
        try {
          return await SecureStore.getItemAsync(sanitizeKey(key));
        } catch {
          return null; // Falha silenciosa; auth continua sem sessão salva.
        }
      },
      setItem: async (key, value) => {
        try {
          await SecureStore.setItemAsync(sanitizeKey(key), value);
        } catch {
          // Ignora falha de escrita (ex.: simulador sem Keychain).
        }
      },
      removeItem: async (key) => {
        try {
          await SecureStore.deleteItemAsync(sanitizeKey(key));
        } catch {
          // Ignora falha de remoção.
        }
      },
    };

    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(secureStorePersistence),
    });
  } catch (e) {
    // Fallback: se o SecureStore falhar no boot (ex.: primeiro ciclo no emulador),
    // inicializa sem persistência para não travar o app.
    console.warn('[Firebase] SecureStore indisponível, usando auth sem persistência.', e);
    try {
      auth = initializeAuth(app);
    } catch {
      const { getAuth } = require('firebase/auth');
      auth = getAuth(app);
    }
  }
}

// ─── Firestore ────────────────────────────────────────────────────────────────
const db = getFirestore(app);

export { app, auth, db };
