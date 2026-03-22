import React, { useState, useEffect, useRef } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar, View, Animated, StyleSheet, ActivityIndicator } from 'react-native';
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
  'hq',
  'ClubeScreen',
  'AgendaScreen',
  'TabelaScreen',
  'PlanosScreen',
  'LojaScreen',
  'PortalSocioScreen',
] as const;

const ROUTE_TO_TAB: Record<string, TabId> = {
  hq:                'Home',
  ClubeScreen:       'Clube',
  AgendaScreen:      'Agenda',
  TabelaScreen:      'Agenda',
  PlanosScreen:      'Socio',
  PortalSocioScreen: 'Socio',
  LojaScreen:        'Loja',
};

// ─── Componente ──────────────────────────────────────────────────────────────
export default function Layout() {
  const segments = useSegments();
  const router   = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>('Home');
  const [isLogged,  setIsLogged]  = useState(false);

  /**
   * isReady: bloqueia a renderização até o Firebase responder pela 1ª vez.
   * Evita o flash de tela branca na Vercel e no cold-start mobile,
   * onde o estado de autenticação ainda é desconhecido.
   */
  const [isReady, setIsReady] = useState(false);

  // ─── Animações de fade (uma por aba, refs estáveis entre renders) ─────────
  const fadeAnims = useRef<Record<TabId, Animated.Value>>({
    Home:   new Animated.Value(1),
    Clube:  new Animated.Value(0),
    Agenda: new Animated.Value(0),
    Socio:  new Animated.Value(0),
    Loja:   new Animated.Value(0),
  }).current;

  // ─── Listener de autenticação ─────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLogged(!!user);
      // Libera o render somente após a primeira resposta do Firebase.
      setIsReady(true);
    });
    return () => unsubscribe();
  }, []);

  // ─── Detecção da rota atual (compatível com Expo Router SDK 54) ───────────
  // useSegments() retorna cada segmento da URL. O último é a rota ativa.
  // Ex.: ['(app)', 'hq'] → currentPath = 'hq'
  // O fallback '' garante string mesmo com segments vazio.
  const currentPath: string = segments[segments.length - 1] ?? '';

  const isMainApp = (MAIN_APP_ROUTES as readonly string[]).includes(currentPath);

  // ─── Sincroniza activeTab se navegar via router (ex: botão voltar) ────────
  useEffect(() => {
    const mappedTab = ROUTE_TO_TAB[currentPath];
    if (mappedTab && mappedTab !== activeTab) {
      handleTabChange(mappedTab);
    }
  }, [currentPath]);

  // ─── Troca de aba com fade ────────────────────────────────────────────────
  const handleTabChange = (newTab: TabId) => {
    if (newTab === activeTab) return;

    Animated.timing(fadeAnims[activeTab], {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnims[newTab], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setActiveTab(newTab);
  };

  // ─── Renderizador de seção persistida ────────────────────────────────────
  const renderSection = (
    id: TabId,
    Component: React.ComponentType<any>,
    extraProps: Record<string, unknown> = {}
  ) => {
    const isActive = activeTab === id;

    return (
      <Animated.View
        key={id}
        pointerEvents={isActive ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: fadeAnims[id],
            zIndex: isActive ? 10 : 0,
            backgroundColor: '#F4F4F0',
          },
        ]}
      >
        <Component {...extraProps} />
      </Animated.View>
    );
  };

  // ─── Loader de inicialização ──────────────────────────────────────────────
  // Mostrado enquanto o Firebase ainda não respondeu — evita tela branca.
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002147" />
      </View>
    );
  }

  // ─── Render principal ─────────────────────────────────────────────────────
  return (
    <DataProvider>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        {isMainApp && <HeaderTatico />}

        <View style={{ flex: 1 }}>
          {/* Stack para rotas fora das tabs (Login, Intro, Detalhes, etc.) */}
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: '#F4F4F0' },
              // Mantém a tela anterior montada para evitar re-mount nas tabs
              detachPreviousScreen: false,
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

          {/* Switcher persistente — sobrepõe o Stack quando dentro do app principal */}
          {isMainApp && (
            <View style={StyleSheet.absoluteFill}>
              {renderSection('Home',   HQMaricaScreen)}
              {renderSection('Clube',  ClubeScreen)}
              {renderSection('Agenda', TabelaScreen)}
              {renderSection('Socio',  isLogged ? PortalSocioScreen : PlanosScreen)}
              {renderSection('Loja',   LojaScreen)}
            </View>
          )}
        </View>

        {isMainApp && (
          <NavBar
            activeRoute={activeTab}
            onTabPress={handleTabChange}
          />
        )}
      </View>
    </DataProvider>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F0',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F4F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
