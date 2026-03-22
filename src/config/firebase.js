import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

/**
 * firebase.js — blindado para produção (Expo SDK 54)
 *
 * Ordem de prioridade de persistência:
 *   Web    → browserLocalPersistence (localStorage do navegador)
 *   Mobile → SecureStore (expo-secure-store)
 *   Fallback → sessão em memória (app funciona, mas não lembra o login)
 *
 * Cada etapa tem try/catch independente para que uma falha
 * não trave o boot e deixe o app em tela branca.
 */

// ─── Config — todas as chaves obrigatoriamente via EXPO_PUBLIC_ ───────────────
// Declare no .env local e nas Environment Variables da Vercel.
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// ─── App singleton (safe para hot-reload e SSR) ───────────────────────────────
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ─── Auth com fallback em cascata ─────────────────────────────────────────────
let auth;

if (Platform.OS === 'web') {
  // Web / Vercel → persiste no localStorage
  try {
    auth = initializeAuth(app, { persistence: browserLocalPersistence });
  } catch {
    // initializeAuth já foi chamado (hot-reload) → reutiliza instância
    auth = getAuth(app);
  }
} else {
  // Mobile → tenta SecureStore, cai para sem-persistência se falhar
  try {
    const SecureStore = require('expo-secure-store');

    // Firebase exige chaves sem caracteres especiais
    const sanitize = (key) => key.replace(/[^a-zA-Z0-9.-]/g, '_');

    const secureStorePersistence = {
      getItem:    async (key) => { try { return await SecureStore.getItemAsync(sanitize(key));        } catch { return null; } },
      setItem:    async (key, value) => { try { await SecureStore.setItemAsync(sanitize(key), value); } catch { /* ignora */ } },
      removeItem: async (key) => { try { await SecureStore.deleteItemAsync(sanitize(key));             } catch { /* ignora */ } },
    };

    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(secureStorePersistence),
    });
  } catch (e) {
    console.warn('[Firebase] SecureStore indisponível — usando auth sem persistência.', e);
    try   { auth = initializeAuth(app); }
    catch { auth = getAuth(app); }
  }
}

// ─── Firestore ────────────────────────────────────────────────────────────────
const db = getFirestore(app);

export { app, auth, db };
