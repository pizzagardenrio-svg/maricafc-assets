import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = { navy: '#002147', gold: '#D4AF37', white: '#FFFFFF' };

export default function BannerPromo() {
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/tv-marica-crowd.jpg')} 
        style={styles.bg}
        imageStyle={{ borderRadius: 10 }}
      >
        <LinearGradient
          colors={['rgba(0,33,71,0.8)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlay}
        >
          <Text style={styles.year}>TEMPORADA 2026</Text>
          <Text style={styles.title}>SÓCIO{"\n"}TSUNAMI</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ESCOLHA SEU PLANO E FAÇA A DIFERENÇA</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 180, margin: 20, marginBottom: 10, elevation: 10 },
  bg: { flex: 1, justifyContent: 'center' },
  overlay: { flex: 1, padding: 20, borderRadius: 10, justifyContent: 'center' },
  year: { color: COLORS.gold, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '900', lineHeight: 30, marginTop: 5 },
  badge: { backgroundColor: COLORS.gold, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, marginTop: 10, borderRadius: 4 },
  badgeText: { color: COLORS.navy, fontSize: 9, fontWeight: '900' }
});
