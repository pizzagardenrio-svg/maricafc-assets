import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Adaptador para fazer o expo-secure-store ser compatível com as regras de AsyncStorage do auth
const sanitizeKey = (key) => key.replace(/[^a-zA-Z0-9.-]/g, '_');

const secureStorePersistence = {
  getItem: async (key) => await SecureStore.getItemAsync(sanitizeKey(key)),
  setItem: async (key, value) => await SecureStore.setItemAsync(sanitizeKey(key), value),
  removeItem: async (key) => await SecureStore.deleteItemAsync(sanitizeKey(key)),
};

// Inicializa o Auth de acordo com a plataforma
let auth;
if (Platform.OS === 'web') {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(secureStorePersistence)
  });
}

const db = getFirestore(app);

export { app, auth, db };
