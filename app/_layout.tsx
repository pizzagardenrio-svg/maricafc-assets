import React, { useState, useEffect, useRef } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { View, Text, Animated, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import NavBar from '../src/components/NavBar';
import HeaderTatico from '../src/components/HeaderTatico';
import { DataProvider } from '../src/context/DataContext';

// Screens persistidas (abas principais)
import HQMaricaScreen from './hq';
import ClubeScreen from './ClubeScreen';
import TabelaScreen from './TabelaScreen';
import PlanosScreen from './PlanosScreen';
import LojaScreen from './LojaScreen';
import PortalSocioScreen from './PortalSocioScreen';
import { auth } from '../src/config/firebase';

// ─── Tipos ───────────────────────────────────────────────────────────────────
type TabId = 'Home' | 'Clube' | 'Agenda' | 'Socio' | 'Loja';

const MAIN_APP_ROUTES = [
  'hq', 'ClubeScreen', 'AgendaScreen', 'TabelaScreen',
  'PlanosScreen', 'LojaScreen', 'PortalSocioScreen',
] as const;

const ROUTE_TO_TAB: Record<string, TabId> = {
  hq: 'Home', ClubeScreen: 'Clube',
  AgendaScreen: 'Agenda', TabelaScreen: 'Agenda',
  PlanosScreen: 'Socio', PortalSocioScreen: 'Socio',
  LojaScreen: 'Loja',
};

const BG = '#F4F4F0';

// ─── Injeção de CSS global para Web (Edge-to-Edge real) ──────────────────────
// Chamado UMA vez, fora do ciclo de render — evita re-injeção a cada mount.
function injectWebCSS() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const id = '__marica_global_css';
  if (document.getElementById(id)) return; // já injetado

  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    /* ── Reset total para Edge-to-Edge ── */
    *, *::before, *::after { box-sizing: border-box; }

    html {
      margin: 0 !important;
      padding: 0 !important;
      /* Ocupa a área completa incluindo safe-areas (notch/barra de nav) */
      height: 100% !important;
      height: -webkit-fill-available !important;
      background-color: ${BG} !important;
      overflow: hidden !important;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      /* Fallback para browsers que não suportam dvh */
      height: 100% !important;
      /* Altura dinâmica que respeita notch e barra de navegação */
      min-height: 100dvh !important;
      background-color: ${BG} !important;
      overflow: hidden !important;
      /* Remove tarjas pretas em áreas de safe-area */
      -webkit-tap-highlight-color: transparent;
    }

    /* Suporte a PWA standalone / fullscreen no iOS Safari */
    @supports (-webkit-touch-callout: none) {
      body {
        /* Preenche até a barra de status do iOS */
        padding-top: env(safe-area-inset-top) !important;
        padding-bottom: env(safe-area-inset-bottom) !important;
        padding-left: env(safe-area-inset-left) !important;
        padding-right: env(safe-area-inset-right) !important;
        height: -webkit-fill-available !important;
      }
    }

    #root {
      margin: 0 !important;
      padding: 0 !important;
      height: 100% !important;
      min-height: 100dvh !important;
      background-color: ${BG} !important;
      overflow: hidden !important;
    }

    /* Meta theme-color já está no app.json, mas reforça via CSS */
    :root {
      color-scheme: light;
    }

    /* Remove scroll em qualquer filho que possa vazar */
    html, body, #root {
      overscroll-behavior: none !important;
    }
  `;
  document.head.prepend(style); // prepend = maior prioridade que outros estilos

  // Garante que o meta theme-color (cor da status bar mobile browser) seja #F4F4F0
  // evitando a tarja preta no Chrome Android
  let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!metaTheme) {
    metaTheme = document.createElement('meta') as HTMLMetaElement;
    metaTheme.name = 'theme-color';
    document.head.appendChild(metaTheme);
  }
  metaTheme.content = BG;

  // viewport-fit=cover é crítico para o Edge-to-Edge no iOS Safari
  let metaViewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (metaViewport) {
    metaViewport.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
  }
}

// Executa imediatamente no módulo (antes do primeiro render)
injectWebCSS();

// ─── Componente interno (já dentro do DataProvider) ───────────────────────────
function AppShell() {
  const segments = useSegments();

  const [activeTab, setActiveTab] = useState<TabId>('Home');
  const [isLogged,  setIsLogged]  = useState(false);
  const [isReady,   setIsReady]   = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  const fadeAnims = useRef<Record<TabId, Animated.Value>>({
    Home: new Animated.Value(1), Clube: new Animated.Value(0),
    Agenda: new Animated.Value(0), Socio: new Animated.Value(0),
    Loja: new Animated.Value(0),
  }).current;

  // ─── Listener Firebase ──────────────────────────────────────────────────
  useEffect(() => {
    let unsubscribe: () => void;
    try {
      unsubscribe = auth.onAuthStateChanged(
        (user) => {
          setIsLogged(!!user);
          setIsReady(true);
        },
        (error) => {
          console.error('[Auth] onAuthStateChanged error:', error);
          setBootError(`Erro de autenticação: ${error.message}`);
          setIsReady(true);
        }
      );
    } catch (e: any) {
      console.error('[Auth] Falha ao registrar listener:', e);
      setBootError(`Firebase não inicializou: ${e?.message ?? e}`);
      setIsReady(true);
    }

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // ─── Rota atual ─────────────────────────────────────────────────────────
  const currentPath: string = segments[segments.length - 1] ?? '';
  const isMainApp = (MAIN_APP_ROUTES as readonly string[]).includes(currentPath);

  useEffect(() => {
    const mappedTab = ROUTE_TO_TAB[currentPath];
    if (mappedTab && mappedTab !== activeTab) handleTabChange(mappedTab);
  }, [currentPath]);

  // ─── Troca de aba com fade ──────────────────────────────────────────────
  const handleTabChange = (newTab: TabId) => {
    if (newTab === activeTab) return;
    Animated.timing(fadeAnims[activeTab], { toValue: 0, duration: 250, useNativeDriver: true }).start();
    Animated.timing(fadeAnims[newTab],    { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setActiveTab(newTab);
  };

  const renderSection = (id: TabId, Component: React.ComponentType<any>, extraProps: Record<string, unknown> = {}) => (
    <Animated.View
      key={id}
      pointerEvents={activeTab === id ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { opacity: fadeAnims[id], zIndex: activeTab === id ? 10 : 0, backgroundColor: BG }]}
    >
      <Component {...extraProps} />
    </Animated.View>
  );

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002147" />
      </View>
    );
  }

  if (bootError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Erro de Inicialização</Text>
        <Text style={styles.errorMsg}>{bootError}</Text>
        <Text style={styles.errorHint}>
          Verifique as variáveis EXPO_PUBLIC_FIREBASE_* na Vercel e redeploie.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent={true} />

      {isMainApp && <HeaderTatico />}

      <View style={styles.body}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: BG },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="intro" />
          <Stack.Screen name="hq"                options={{ animation: 'none' }} />
          <Stack.Screen name="ClubeScreen"       options={{ animation: 'none' }} />
          <Stack.Screen name="AgendaScreen"      options={{ animation: 'none' }} />
          <Stack.Screen name="PlanosScreen"      options={{ animation: 'none' }} />
          <Stack.Screen name="LojaScreen"        options={{ animation: 'none' }} />
          <Stack.Screen name="TabelaScreen"      options={{ animation: 'none' }} />
          <Stack.Screen name="PortalSocioScreen" options={{ animation: 'none' }} />
        </Stack>

        {isMainApp && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]}>
            {renderSection('Home',   HQMaricaScreen)}
            {renderSection('Clube',  ClubeScreen)}
            {renderSection('Agenda', TabelaScreen)}
            {renderSection('Socio',  isLogged ? PortalSocioScreen : PlanosScreen)}
            {renderSection('Loja',   LojaScreen)}
          </View>
        )}
      </View>

      {isMainApp && <NavBar activeRoute={activeTab} onTabPress={handleTabChange} />}
    </View>
  );
}

// ─── Wrapper Responsivo Imersivo ─────────────────────────────────────────────
function ResponsiveWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // SDK 54: NavigationBar transparente + botões escuros
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('#00000000');
      NavigationBar.setButtonStyleAsync('dark');
    }
    // Web: CSS já foi injetado via injectWebCSS() antes do primeiro render
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOuterContainer}>
        <View style={styles.webInnerContainer}>
          {children}
        </View>
      </View>
    );
  }

  // Native: ocupa tudo incluindo safe areas (StatusBar translucent já cuida do topo)
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {children}
    </View>
  );
}

// ─── Layout raiz ─────────────────────────────────────────────────────────────
export default function Layout() {
  return (
    <DataProvider>
      <ResponsiveWrapper>
        <AppShell />
      </ResponsiveWrapper>
    </DataProvider>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, backgroundColor: BG,
    justifyContent: 'center', alignItems: 'center',
  },
  errorContainer: {
    flex: 1, backgroundColor: '#FFF3F3',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  errorTitle: { fontSize: 18, fontWeight: '900', color: '#880000', marginBottom: 12 },
  errorMsg:   { fontSize: 13, color: '#550000', textAlign: 'center', marginBottom: 16 },
  errorHint:  { fontSize: 11, color: '#888', textAlign: 'center' },
  container:  { flex: 1, backgroundColor: BG },
  body:       { flex: 1, backgroundColor: BG },

  // Web: container externo cobre 100dvh sem safe-area gaps
  webOuterContainer: {
    flex: 1,
    backgroundColor: BG,
    // Em React Native Web, usamos minHeight via style object
    ...(Platform.OS === 'web' ? {
      minHeight: '100dvh' as any,
      overflow: 'hidden' as any,
    } : {}),
  },
  webInnerContainer: {
    flex: 1,
    backgroundColor: BG,
    ...(Platform.OS === 'web' ? {
      width: '100%',
      maxWidth: 480,
      marginLeft: 'auto' as any,
      marginRight: 'auto' as any,
      boxShadow: '0px 0px 20px rgba(0,0,0,0.1)' as any,
      overflow: 'hidden' as any,
      minHeight: '100dvh' as any,
    } : {}),
  },
});
