import React, { useState, useEffect, useRef } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar, View, Text, Animated, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

// ─── Componente interno (já dentro do DataProvider) ───────────────────────────
// Separar o shell que precisa do DataProvider do guard de Firebase evita
// o bug crítico de montar o DataProvider DEPOIS do guard — o que fazia
// useData() explodir nas telas filhas quando isReady ainda era false.
function AppShell() {
  const segments = useSegments();

  const [activeTab, setActiveTab] = useState<TabId>('Home');
  const [isLogged,  setIsLogged]  = useState(false);
  const [isReady,   setIsReady]   = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  // Animações de fade — refs estáveis, nunca recriadas
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
          // onAuthStateChanged pode emitir erro se a config do Firebase estiver errada
          console.error('[Auth] onAuthStateChanged error:', error);
          setBootError(`Erro de autenticação: ${error.message}`);
          setIsReady(true); // libera mesmo assim para não ficar preso no loader
        }
      );
    } catch (e: any) {
      console.error('[Auth] Falha ao registrar listener:', e);
      setBootError(`Firebase não inicializou: ${e?.message ?? e}`);
      setIsReady(true);
    }

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // ─── Rota atual (Expo Router SDK 54) ───────────────────────────────────
  const currentPath: string = segments[segments.length - 1] ?? '';
  const isMainApp = (MAIN_APP_ROUTES as readonly string[]).includes(currentPath);

  // Sincroniza aba ao navegar via router / botão voltar
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

  // ─── Renderizador de seção persistida ──────────────────────────────────
  const renderSection = (id: TabId, Component: React.ComponentType<any>, extraProps: Record<string, unknown> = {}) => (
    <Animated.View
      key={id}
      pointerEvents={activeTab === id ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, { opacity: fadeAnims[id], zIndex: activeTab === id ? 10 : 0, backgroundColor: BG }]}
    >
      <Component {...extraProps} />
    </Animated.View>
  );

  // ─── Loader de boot ─────────────────────────────────────────────────────
  // DataProvider JÁ ESTÁ MONTADO aqui (estamos dentro dele) — contexto disponível.
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002147" />
      </View>
    );
  }

  // ─── Tela de erro de boot (visível em produção para diagnóstico) ────────
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

  // ─── Render principal ───────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

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

// ─── Wrapper Responsivo (Web vs Native) ────────────────────────────────────
function ResponsiveWrapper({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[{ flex: 1, width: '100%', backgroundColor: BG },
      Platform.OS === 'web' && { 
        maxWidth: 480, 
        marginHorizontal: 'auto',
        boxShadow: '0px 0px 20px rgba(0,0,0,0.1)' as any,
      },
      {
        paddingTop: Platform.OS === 'web' ? 0 : insets.top,
        paddingBottom: Platform.OS === 'web' ? 0 : insets.bottom
      }
    ]}>
      {children}
    </View>
  );
}

// ─── Layout raiz — DataProvider SEMPRE monta primeiro ────────────────────────
// Separar Provider do AppShell garante que o contexto exista
// antes de qualquer tela filha tentar consumi-lo via useData().
export default function Layout() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <ResponsiveWrapper>
          <AppShell />
        </ResponsiveWrapper>
      </DataProvider>
    </SafeAreaProvider>
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
});
