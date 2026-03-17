import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  navy: '#002147',
  red: '#FF0000',
  paper: '#F4F4F0',
  white: '#FFFFFF',
  muted: '#858580',
};

export default function CampaignLogScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logItem}>
          <Text style={styles.logDate}>26 FEV 2026</Text>
          <Text style={styles.logStatus}>SISTEMA INICIALIZADO</Text>
          <Text style={styles.logDesc}>Ambiente Expo SDK 54 configurado com sucesso.</Text>
        </View>
        {/* Adicione mais itens de log conforme necessário */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F0' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: COLORS.navy, flexDirection: 'row', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backText: { color: '#FF0000', fontWeight: 'bold' },
  content: { padding: 20 },
  logItem: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E5E5E0' },
  logDate: { fontSize: 10, color: '#858580', marginBottom: 5 },
  logStatus: { fontWeight: 'bold', color: '#002147', marginBottom: 5 },
  logDesc: { fontSize: 13, color: '#444' }
});
