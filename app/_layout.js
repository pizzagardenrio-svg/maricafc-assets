import React, { useState, useEffect, useRef } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar, View, Animated, StyleSheet } from 'react-native';
import NavBar from '../src/components/NavBar';
import HeaderTatico from '../src/components/HeaderTatico';
import { DataProvider } from '../src/context/DataContext';

// Screens que serão persistidas (Abas principais)
import HQMaricaScreen from './hq';
import ClubeScreen from './ClubeScreen';
import TabelaScreen from './TabelaScreen';
import PlanosScreen from './PlanosScreen';
import LojaScreen from './LojaScreen';
import PortalSocioScreen from './PortalSocioScreen';
import { auth } from '../src/config/firebase';

export default function Layout() {
  const segments = useSegments();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Home');
  const [isLogged, setIsLogged] = useState(false);
  
  // Opacity animations for each section
  const fadeAnims = {
    Home: useRef(new Animated.Value(1)).current,
    Clube: useRef(new Animated.Value(0)).current,
    Agenda: useRef(new Animated.Value(0)).current,
    Socio: useRef(new Animated.Value(0)).current,
    Loja: useRef(new Animated.Value(0)).current,
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLogged(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Determina se estamos em uma rota que deve mostrar a UI persistente
  const currentPath = segments[segments.length - 1];
  const isMainApp = ['hq', 'ClubeScreen', 'AgendaScreen', 'TabelaScreen', 'PlanosScreen', 'LojaScreen', 'PortalSocioScreen'].includes(currentPath);

  // Mapeamento para sincronizar o estado da aba caso o usuário navegue via router (ex: botão voltar)
  const routeToId = {
    'hq': 'Home',
    'ClubeScreen': 'Clube',
    'AgendaScreen': 'Agenda',
    'TabelaScreen': 'Agenda',
    'PlanosScreen': 'Socio',
    'PortalSocioScreen': 'Socio',
    'LojaScreen': 'Loja',
  };

  useEffect(() => {
    if (routeToId[currentPath] && routeToId[currentPath] !== activeTab) {
      handleTabChange(routeToId[currentPath]);
    }
  }, [currentPath]);

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;

    // Fade out current
    Animated.timing(fadeAnims[activeTab], {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    // Fade in new
    Animated.timing(fadeAnims[newTab], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setActiveTab(newTab);
  };

  const renderSection = (id, Component, extraProps = {}) => {
    const isActive = activeTab === id;
    
    return (
      <Animated.View 
        pointerEvents={isActive ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill, 
          { 
            opacity: fadeAnims[id],
            zIndex: isActive ? 10 : 0,
            backgroundColor: '#F4F4F0'
          }
        ]}
      >
        <Component {...extraProps} />
      </Animated.View>
    );
  };

  return (
    <DataProvider>
      <View style={{ flex: 1, backgroundColor: '#F4F4F0' }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {isMainApp && <HeaderTatico />}

        <View style={{ flex: 1 }}>
          {/* Stack para rotas que NÃO são as tabs persistentes (Login, Intro, Detalhes, etc) */}
          <Stack screenOptions={{ 
            headerShown: false, 
            animation: 'fade',
            contentStyle: { backgroundColor: '#F4F4F0' },
            detachPreviousScreen: false
          }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="intro" />
            <Stack.Screen name="hq" options={{ animation: 'none' }} />
            <Stack.Screen name="ClubeScreen" options={{ animation: 'none' }} />
            <Stack.Screen name="AgendaScreen" options={{ animation: 'none' }} />
            <Stack.Screen name="PlanosScreen" options={{ animation: 'none' }} />
            <Stack.Screen name="LojaScreen" options={{ animation: 'none' }} />
            <Stack.Screen name="TabelaScreen" options={{ animation: 'none' }} />
            <Stack.Screen name="PortalSocioScreen" options={{ animation: 'none' }} />
          </Stack>

          {/* O Switcher Persistente que fica por CIMA do Stack quando isMainApp é true */}
          {isMainApp && (
            <View style={StyleSheet.absoluteFill}>
              {renderSection('Home', HQMaricaScreen)}
              {renderSection('Clube', ClubeScreen)}
              {renderSection('Agenda', TabelaScreen)}
              {renderSection('Socio', isLogged ? PortalSocioScreen : PlanosScreen)}
              {renderSection('Loja', LojaScreen)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F0' }
});
