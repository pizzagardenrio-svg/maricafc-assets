import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = { navy: '#002147', gold: '#D4AF37', white: '#FFFFFF', muted: '#858580' };

export default function CardParceiro() {
  return (
    <View style={styles.card}>
      <View style={styles.goldBar} />
      <Image source={{ uri: item.img }} style={styles.logo} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.categoria}>{item.categoria?.toUpperCase()}</Text>
        <Text style={styles.nome}>{item.nome}</Text>
        <View style={styles.badgeDesconto}>
          <Text style={styles.descontoText}>{item.desconto}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', backgroundColor: COLORS.white, marginBottom: 12, 
    borderRadius: 10, elevation: 4, overflow: 'hidden', alignItems: 'center', height: 90 
  },
  goldBar: { width: 4, height: '100%', backgroundColor: COLORS.gold },
  logo: { width: 60, height: 60, marginLeft: 15, backgroundColor: '#F8F8F8', borderRadius: 8 },
  info: { flex: 1, paddingHorizontal: 15 },
  categoria: { fontSize: 8, fontWeight: '900', color: COLORS.gold, letterSpacing: 1 },
  nome: { fontSize: 14, fontWeight: '900', color: COLORS.navy, marginVertical: 2 },
  badgeDesconto: { 
    backgroundColor: 'rgba(0,33,71,0.05)', alignSelf: 'flex-start', 
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: COLORS.navy 
  },
  descontoText: { fontSize: 9, color: COLORS.navy, fontWeight: '900' }
});
