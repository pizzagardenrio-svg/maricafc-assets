import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  navy: '#002147',
  red: '#FF0000',
  paper: '#F4F4F0',
  white: '#FFFFFF',
  muted: '#858580',
  deepDarkRed: '#550000',
};

const JOGOS = [
  { id: '1', adversario: 'SAMPAIO CORRÊA', data: '26 FEV 2026', hora: '15:00', local: 'Lourival Gomes', campeonato: 'CARIOCA - RODADA 9' },
  { id: '2', adversario: 'VOLTA REDONDA', data: '04 MAR 2026', hora: '19:00', local: 'Raulino de Oliveira', campeonato: 'CARIOCA - RODADA 10' },
  { id: '3', adversario: 'AUDAX RIO', data: '11 MAR 2026', hora: '15:30', local: 'Moça Bonita', campeonato: 'CARIOCA - RODADA 11' },
];

export default function AgendaScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>CAMPEONATO CARIOCA</Text>
        {JOGOS.map((jogo) => (
          <View key={jogo.id} style={styles.gameCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.leagueText}>{jogo.campeonato}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>CONFIRMADO</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.teamRow}>
                <Text style={styles.teamName}>MARICÁ FC</Text>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.teamName}>{jogo.adversario}</Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>DATA/HORA</Text>
                  <Text style={styles.infoValue}>{jogo.data} • {jogo.hora}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>LOCAL</Text>
                  <Text style={styles.infoValue}>{jogo.local}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.ticketButton}>
              <Text style={styles.ticketButtonText}>DETALHES DA MISSÃO</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: COLORS.deepDarkRed, marginLeft: 20, marginBottom: 15, marginTop: 20, letterSpacing: 1, opacity: 1 },
  gameCard: { backgroundColor: COLORS.white, borderRadius: 8, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E5E0', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  leagueText: { fontSize: 10, fontWeight: 'bold', color: COLORS.muted },
  statusBadge: { backgroundColor: 'transparent' },
  statusText: { fontSize: 9, fontWeight: 'bold', color: '#059669' },
  cardBody: { padding: 16 },
  teamRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 },
  teamName: { fontSize: 16, fontWeight: '800', color: COLORS.navy, width: '40%', textAlign: 'center' },
  vsText: { fontSize: 12, fontWeight: 'bold', color: COLORS.red },
  infoGrid: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 9, color: COLORS.muted, marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.navy, marginBottom: 8 },
  ticketButton: { backgroundColor: COLORS.navy, padding: 12, alignItems: 'center' },
  ticketButtonText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }
});
