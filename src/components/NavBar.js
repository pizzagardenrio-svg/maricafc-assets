import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';

const COLORS = {
  deepDarkRed: '#550000', // Ativo (Escuro)
  darkRed: '#A00000',     // Inativo (Claro/Desbotado)
  paper: '#F4F4F0',
  white: '#FFFFFF',
};

const NAV_ITEMS = [
  { id: 'Home', icon: 'home', label: 'INÍCIO', route: '/hq' },
  { id: 'Clube', icon: 'shield', label: 'CLUBE', route: '/ClubeScreen' },
  { id: 'Agenda', icon: 'calendar', label: 'JOGOS', route: '/TabelaScreen' },
  { id: 'Socio', icon: 'star', label: 'SÓCIO', route: '/PlanosScreen' }, // Route handled dynamically
  { id: 'Loja', icon: 'cart', label: 'LOJA', route: '/LojaScreen' },
];

export default function NavBar({ activeRoute, onTabPress }) {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLogged(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handlePress = (item) => {
    if (activeRoute === item.id) return;

    // Report to parent (Layout) to trigger persistent visibility change
    if (onTabPress) {
      onTabPress(item.id);
    }

    // Still navigate to the route to keep segments/URL in sync (transparently)
    if (item.id === 'Socio') {
      router.push(isLogged ? '/PortalSocioScreen' : '/PlanosScreen');
    } else {
      router.push(item.route);
    }
  };

  return (
    <LinearGradient 
      // Degradê: tom mais escuro na base (y:1) para white no topo (y:0)
      colors={['#E0E0D8', COLORS.white]} 
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.navContainer}
    >
      <View style={styles.topBorder} />
      <View style={styles.content}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.id;
          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.navItem}
              onPress={() => handlePress(item)}
            >
              <Ionicons 
                name={isActive ? item.icon : `${item.icon}-outline`} 
                size={22} 
                color={isActive ? COLORS.deepDarkRed : COLORS.darkRed} 
              />
              <Text style={[styles.navLabel, { color: isActive ? COLORS.deepDarkRed : COLORS.darkRed }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    // Aumentado ligeiramente para preencher o fundo da tela dos iPhones
    height: 95, 
    justifyContent: 'flex-start',
    zIndex: 100,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.05)', // Borda sutil para separar do conteúdo
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12, // Empurra o conteúdo um pouco para cima, longe da borda inferior do celular
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 8,
    fontWeight: '900',
    marginTop: 5,
    letterSpacing: 0.5,
  },
});
