import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Image, TouchableOpacity, Linking, StatusBar, Modal, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../src/config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import CardProximoJogo from '../src/components/CardProximoJogo';

const COLORS = {
  navy: '#002147', gold: '#D4AF37', paper: '#F4F4F0',
  white: '#FFFFFF', muted: '#858580', g2: '#4CAF50',
  darkRed: '#440000', deepDarkRed: '#550000', lightNavy: '#003366'
};

export default function TabelaScreen() {
  const router = useRouter();
  const [grupos, setGrupos] = useState({ A: [], B: [] });
  const [logosDb, setLogosDb] = useState({});
  const [loading, setLoading] = useState(true);
  
  // States Modal Partida
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchTabela = async () => {
      try {
        const q = query(collection(db, "tabela_carioca"), orderBy("pts", "desc"));
        const querySnapshot = await getDocs(q);
        const allTeams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mapLogos = {};
        allTeams.forEach(t => {
          mapLogos[t.id] = { uri: t.escudo };
        });
        setLogosDb(mapLogos);

        setGrupos({
          A: allTeams.filter(t => t.grupo === "A"),
          B: allTeams.filter(t => t.grupo === "B")
        });
      } catch (error) {
        console.error("Erro ao carregar tabela:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTabela();
  }, []);

  const RenderTabela = ({ data, nomeGrupo }) => (
    <View style={styles.groupWrapper}>
      <View style={styles.groupHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.groupTitle}>GRUPO {nomeGrupo}</Text>
          <View style={styles.headerVerticalDivider} />
          <Text style={styles.groupSub}>TAÇA GUANABARA 2026</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.label, { flex: 1 }]}>POS</Text>
        <Text style={[styles.label, { flex: 2, textAlign: 'center' }]}>CLUBE</Text>
        <Text style={[styles.label, { flex: 1 }]}>P</Text>
        <Text style={[styles.label, { flex: 1 }]}>J</Text>
        <Text style={[styles.label, { flex: 1 }]}>V</Text>
        <Text style={[styles.label, { flex: 1 }]}>SG</Text>
      </View>

      {data.map((item, index) => {
        const isMarica = item.time?.toUpperCase().includes('MARICÁ');
        return (
          <View key={index} style={[styles.row, isMarica && styles.highlightRowMarica]}>
            {index < 2 && <View style={styles.g2Indicator} />}
            <Text style={[styles.cell, { flex: 1, fontWeight: '900', color: isMarica ? COLORS.gold : COLORS.navy }]}>{index + 1}º</Text>

            <View style={[styles.cell, { flex: 2, alignItems: 'center', justifyContent: 'center' }]}>
              <Image source={{ uri: item.escudo }} style={styles.tableShield} />
            </View>

            <Text style={[styles.cell, { flex: 1, fontWeight: '900', color: isMarica ? COLORS.gold : COLORS.navy }]}>{item.pts}</Text>
            <Text style={[styles.cell, { flex: 1, color: COLORS.muted }]}>{item.j || 0}</Text>
            <Text style={[styles.cell, { flex: 1, color: COLORS.muted }]}>{item.v}</Text>
            <Text style={[styles.cell, { flex: 1, color: COLORS.muted }]}>{item.sg}</Text>
          </View>
        );
      })}
    </View>
  );

  const logoMarica = require('../assets/images/escudo-redondo-02.png');
  const fallbackLogo = { uri: "https://raw.githubusercontent.com/pizzagardenrio-svg/maricafc-assets/refs/heads/main/escudo-marica-escudo-placeholder.png" }; // Placeholder invisivel

  const historicoJogos = [
    { campeonato: "CARIOCA (GRUPOS)", data: "15 JAN", horario: "15:30", estadio: "João Saldanha", arbitro: "Wagner do Nascimento Mag.", time1: "VASCO", logo1: logosDb["vasco"] || fallbackLogo, score: "4 - 2", time2: "MARICÁ FC", logo2: logoMarica, status: "DERROTA", gols: [{time: "Vasco", jogador: "Payet", min: "12'"}, {time: "Maricá", jogador: "Pablo Thomaz", min: "34'"}, {time: "Vasco", jogador: "Vegetti", min: "45+2'"}, {time: "Maricá", jogador: "Felipe", min: "55'"}, {time: "Vasco", jogador: "Pec", min: "78'"}, {time: "Vasco", jogador: "Puma", min: "89'"}] },
    { campeonato: "CARIOCA (GRUPOS)", data: "18 JAN", horario: "16:00", estadio: "Luso-Brasileiro", arbitro: "Bruno Arleu de Araújo", time1: "PORTUGUESA", logo1: logosDb["portuguesa"] || fallbackLogo, score: "0 - 1", time2: "MARICÁ FC", logo2: logoMarica, status: "VITÓRIA", gols: [{time: "Maricá", jogador: "Sandro", min: "82'"}] },
    { campeonato: "CARIOCA (GRUPOS)", data: "21 JAN", horario: "15:30", estadio: "João Saldanha", arbitro: "Yuri Elino da Cruz", time1: "MARICÁ FC", logo1: logoMarica, score: "1 - 2", time2: "BANGU", logo2: logosDb["bangu"] || fallbackLogo, status: "DERROTA", gols: [{time: "Bangu", jogador: "Cleyton", min: "10'"}, {time: "Maricá", jogador: "Tartá", min: "40'"}, {time: "Bangu", jogador: "Rochinha", min: "71'"}] },
    { campeonato: "CARIOCA (GRUPOS)", data: "27 JAN", horario: "15:30", estadio: "João Saldanha", arbitro: "Rafael Martins de Sá", time1: "MARICÁ FC", logo1: logoMarica, score: "0 - 1", time2: "SAMPAIO", logo2: logosDb["sampaiocorrea"] || fallbackLogo, status: "DERROTA", gols: [{time: "Sampaio", jogador: "Elias", min: "88'"}] },
    { campeonato: "CARIOCA (GRUPOS)", data: "02 FEV", horario: "15:30", estadio: "João Saldanha", arbitro: "Alex Gomes", time1: "MARICÁ FC", logo1: logoMarica, score: "1 - 2", time2: "V. REDONDA", logo2: logosDb["voltaredonda"] || fallbackLogo, status: "DERROTA", gols: [{time: "V. Redonda", jogador: "Italo", min: "15'"}, {time: "Maricá", jogador: "Walber", min: "60'"}, {time: "V. Redonda", jogador: "MV", min: "90+4'"}] },
    { campeonato: "CARIOCA (GRUPOS)", data: "08 FEV", horario: "21:30", estadio: "Maracanã", arbitro: "Alexandre Vargas Tavares", time1: "FLUMINENSE", logo1: logosDb["fluminense"] || fallbackLogo, score: "1 - 0", time2: "MARICÁ FC", logo2: logoMarica, status: "DERROTA", gols: [{time: "Fluminense", jogador: "Cano", min: "22'"}] },
    { campeonato: "CARIOCA (QUAD)", data: "12 FEV", horario: "15:30", estadio: "João Saldanha", arbitro: "Grazianni Maciel", time1: "MARICÁ FC", logo1: logoMarica, score: "0 - 4", time2: "SAMPAIO", logo2: logosDb["sampaiocorrea"] || fallbackLogo, status: "DERROTA", gols: [{time: "Sampaio", jogador: "Elias", min: "11'"}, {time: "Sampaio", jogador: "Elias", min: "33'"}, {time: "Sampaio", jogador: "Max", min: "55'"}, {time: "Sampaio", jogador: "Octávio", min: "81'"}] },
    { campeonato: "CARIOCA (QUAD)", data: "16 FEV", horario: "16:00", estadio: "Laranjão", arbitro: "Tarcizo Pinheiro", time1: "NOVA IGUAÇU", logo1: logosDb["novaiguacu"] || fallbackLogo, score: "0 - 1", time2: "MARICÁ FC", logo2: logoMarica, status: "VITÓRIA", gols: [{time: "Maricá", jogador: "Pablo Thomaz", min: "76'"}] },
    { campeonato: "CARIOCA (QUAD)", data: "23 FEV", horario: "15:30", estadio: "João Saldanha", arbitro: "Paulo Renato Moreira", time1: "MARICÁ FC", logo1: logoMarica, score: "0 - 2", time2: "PORTUGUESA", logo2: logosDb["portuguesa"] || fallbackLogo, status: "DERROTA", gols: [{time: "Portuguesa", jogador: "Hernane", min: "20'"}, {time: "Portuguesa", jogador: "Romarinho", min: "65'"}] },
    { campeonato: "CARIOCA (QUAD)", data: "26 FEV", horario: "15:30", estadio: "Lourival Gomes", arbitro: "Felipe da Silva", time1: "SAMPAIO", logo1: logosDb["sampaiocorrea"] || fallbackLogo, score: "2 - 1", time2: "MARICÁ FC", logo2: logoMarica, status: "DERROTA", gols: [{time: "Sampaio", jogador: "Max", min: "44'"}, {time: "Maricá", jogador: "Sandro", min: "52'"}, {time: "Sampaio", jogador: "Elias", min: "89'"}] },
    { campeonato: "CARIOCA (QUAD)", data: "01 MAR", horario: "15:30", estadio: "João Saldanha", arbitro: "Mauricio Machado", time1: "MARICÁ FC", logo1: logoMarica, score: "2 - 2", time2: "NOVA IGUAÇU", logo2: logosDb["novaiguacu"] || fallbackLogo, status: "EMPATE", gols: [{time: "Maricá", jogador: "Hugo", min: "12'"}, {time: "N. Iguaçu", jogador: "Carlinhos", min: "40'"}, {time: "Maricá", jogador: "Tartá", min: "67'"}, {time: "N. Iguaçu", jogador: "Xandinho", min: "88'"}] },
    { campeonato: "CARIOCA (QUAD)", data: "08 MAR", horario: "16:00", estadio: "Luso-Brasileiro", arbitro: "Wagner do Nascimento Mag.", time1: "PORTUGUESA", logo1: logosDb["portuguesa"] || fallbackLogo, score: "5 - 2", time2: "MARICÁ FC", logo2: logoMarica, status: "DERROTA", gols: [{time: "Portuguesa", jogador: "Hernane", min: "5'"}, {time: "Portuguesa", jogador: "Romarinho", min: "15'"}, {time: "Maricá", jogador: "Pablo", min: "25'"}, {time: "Portuguesa", jogador: "Hernane", min: "35'"}, {time: "Maricá", jogador: "Sandro", min: "55'"}, {time: "Portuguesa", jogador: "K. Douglas", min: "75'"}, {time: "Portuguesa", jogador: "Joazi", min: "85'"}] }
  ];

  const openMatchModal = (match) => {
    setSelectedMatch(match);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Banner 100% largura */}
        <View style={styles.bannerWrapper}>
          <CardProximoJogo />
        </View>

        {/* HÍSTORICO DE JOGOS */}
        <View style={styles.innerContent}>
          <Text style={styles.sectionTitle}>HISTÓRICO DE JOGOS | 2026</Text>

          <View style={styles.historyContainer}>
            {historicoJogos.map((jogo, i) => {
              let statusColor = COLORS.muted;
              if (jogo.status === "VITÓRIA") statusColor = COLORS.g2;
              if (jogo.status === "DERROTA") statusColor = COLORS.redAccent || '#E53935';
              if (jogo.status === "EMPATE") statusColor = COLORS.gold;

              return (
                <TouchableOpacity key={i} style={styles.historyRow} onPress={() => openMatchModal(jogo)} activeOpacity={0.6}>
                  <View style={styles.historyMeta}>
                    <Text style={styles.historyDate}>{jogo.data}</Text>
                    <Text style={styles.historyChamp}>{jogo.campeonato}</Text>
                  </View>

                  <View style={styles.historyMatch}>
                    <Image source={jogo.logo1} style={styles.historyLogo} />
                    <Text style={styles.historyScore}>{jogo.score}</Text>
                    <Image source={jogo.logo2} style={styles.historyLogo} />
                  </View>

                  <View style={styles.historyStatusWrapper}>
                    <Text style={[styles.historyStatus, { color: statusColor }]}>
                      {jogo.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 15 }]}>CLASSIFICAÇÃO GERAL</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.gold} size="large" />
              <Text style={styles.loadingText}>ATUALIZANDO TABELA...</Text>
            </View>
          ) : (
            <>
              <RenderTabela data={grupos.A} nomeGrupo="A" />
              <RenderTabela data={grupos.B} nomeGrupo="B" />
            </>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* MODAL DETALHES DA PARTIDA */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          {selectedMatch && (
            <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalSubHeader}>{selectedMatch.campeonato}</Text>
                <Text style={styles.modalMatchDate}>{selectedMatch.data} • {selectedMatch.horario}</Text>
              </View>

              <View style={styles.modalScoreBoard}>
                <View style={styles.modalTeamBox}>
                  <Image source={selectedMatch.logo1} style={styles.modalBigLogo} />
                  <Text style={styles.modalTeamName} numberOfLines={1}>{selectedMatch.time1}</Text>
                </View>

                <View style={styles.modalScoreBox}>
                  <Text style={styles.modalScoreLarge}>{selectedMatch.score}</Text>
                  <Text style={[styles.modalStatusBadge, { 
                    backgroundColor: selectedMatch.status === "VITÓRIA" ? COLORS.g2 : selectedMatch.status === "DERROTA" ? COLORS.darkRed : COLORS.gold 
                  }]}>
                    M.F.C. {selectedMatch.status}
                  </Text>
                </View>

                <View style={styles.modalTeamBox}>
                  <Image source={selectedMatch.logo2} style={styles.modalBigLogo} />
                  <Text style={styles.modalTeamName} numberOfLines={1}>{selectedMatch.time2}</Text>
                </View>
              </View>

              <ScrollView style={styles.modalDetailsScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.modalSection}>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.muted} style={{ width: 20 }} />
                    <Text style={styles.modalDetailText}><Text style={{fontWeight:'800'}}>Estádio:</Text> {selectedMatch.estadio}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="person-outline" size={16} color={COLORS.muted} style={{ width: 20 }} />
                    <Text style={styles.modalDetailText}><Text style={{fontWeight:'800'}}>Árbitro:</Text> {selectedMatch.arbitro}</Text>
                  </View>
                </View>

                {selectedMatch.gols && selectedMatch.gols.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}><Ionicons name="football" size={14} /> DETALHES DOS GOLS</Text>
                    {selectedMatch.gols.map((gol, index) => (
                      <View key={index} style={styles.modalGoalRow}>
                        <Text style={styles.modalGoalMin}>{gol.min}</Text>
                        <Text style={[styles.modalGoalPlayer, { color: gol.time.toUpperCase().includes("MARIC") ? COLORS.navy : COLORS.muted }]}>
                          {gol.jogador} <Text style={{fontWeight: '400', fontSize: 10}}>({gol.time})</Text>
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseBtnText}>FECHAR</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingTop: 0 },
  bannerWrapper: { width: '100%' },

  innerContent: { paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: COLORS.deepDarkRed, marginLeft: 20, marginBottom: 15, letterSpacing: 1, opacity: 1 },

  historyContainer: { backgroundColor: COLORS.white, borderRadius: 16, marginHorizontal: 15, paddingVertical: 5, paddingHorizontal: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  historyMeta: { width: '25%', alignItems: 'center' },
  historyDate: { fontSize: 12, fontWeight: '900', color: COLORS.navy },
  historyChamp: { fontSize: 8, fontWeight: '700', color: COLORS.muted, marginTop: 4, letterSpacing: 0.5, textAlign: 'center' },

  historyMatch: { flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center' },
  historyLogo: { width: 30, height: 30, resizeMode: 'contain', marginHorizontal: 15 },
  historyScore: { fontSize: 20, fontWeight: '900', color: COLORS.navy, letterSpacing: 1 },

  historyStatusWrapper: { width: '20%', alignItems: 'center' },
  historyStatus: { fontSize: 10, fontWeight: '800', color: COLORS.muted },

  loadingBox: { marginTop: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.navy, fontSize: 10, fontWeight: '900', letterSpacing: 2 },

  groupWrapper: {
    marginHorizontal: 15, marginBottom: 25, backgroundColor: COLORS.white,
    borderRadius: 16, overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6
  },
  groupHeader: { paddingVertical: 14, paddingHorizontal: 15, backgroundColor: COLORS.navy, borderBottomWidth: 3, borderBottomColor: COLORS.gold },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  groupTitle: { color: COLORS.gold, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  headerVerticalDivider: { width: 1, height: 12, backgroundColor: 'rgba(212,175,55,0.3)', marginHorizontal: 12 },
  groupSub: { color: COLORS.white, fontSize: 9, fontWeight: '700', opacity: 0.8, letterSpacing: 0.5 },
  tableHeader: { flexDirection: 'row', paddingVertical: 12, backgroundColor: '#F8F9FA' },
  label: { fontSize: 9, fontWeight: '900', color: '#888', textAlign: 'center' },
  row: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  highlightRowMarica: { backgroundColor: 'rgba(212, 175, 55, 0.08)', borderLeftWidth: 4, borderLeftColor: COLORS.gold },
  g2Indicator: { position: 'absolute', left: 0, width: 4, height: '100%', backgroundColor: COLORS.g2 },
  cell: { fontSize: 13, textAlign: 'center', color: COLORS.navy },
  tableShield: { width: 26, height: 26, resizeMode: 'contain' },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,33,71,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 25, paddingBottom: 40, maxHeight: '85%' },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalSubHeader: { color: COLORS.muted, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  modalMatchDate: { color: COLORS.navy, fontSize: 14, fontWeight: '800', marginTop: 4 },
  
  modalScoreBoard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.paper, paddingVertical: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EAEAEA' },
  modalTeamBox: { flex: 1, alignItems: 'center' },
  modalBigLogo: { width: 60, height: 60, resizeMode: 'contain', marginBottom: 8 },
  modalTeamName: { fontSize: 11, fontWeight: '900', color: COLORS.navy, textAlign: 'center', paddingHorizontal: 5 },
  
  modalScoreBox: { flex: 1, alignItems: 'center' },
  modalScoreLarge: { fontSize: 36, fontWeight: '900', color: COLORS.navy, letterSpacing: 2 },
  modalStatusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, color: COLORS.white, fontSize: 9, fontWeight: '900', marginTop: 5, overflow: 'hidden' },

  modalDetailsScroll: { maxHeight: 300 },
  modalSection: { marginBottom: 20, paddingHorizontal: 10 },
  modalDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  modalDetailText: { fontSize: 13, color: COLORS.navy, marginLeft: 8 },
  
  modalSectionTitle: { fontSize: 11, fontWeight: '900', color: COLORS.navy, letterSpacing: 1, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 6 },
  modalGoalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  modalGoalMin: { fontSize: 13, fontWeight: '900', color: COLORS.gold, width: 45 },
  modalGoalPlayer: { fontSize: 14, fontWeight: '800' },

  modalCloseBtn: { backgroundColor: COLORS.navy, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  modalCloseBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '900', letterSpacing: 2 }
});
