import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  SectionList,
  StatusBar,
  TouchableOpacity,
  Pressable,
  FlatList,
  Dimensions,
  ScrollView,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../src/config/firebase';
import { collection, onSnapshot, getDocs, query, orderBy, doc, getDoc, updateDoc, increment, writeBatch } from 'firebase/firestore'; 
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import CampoTatico from '../src/components/CampoTatico';
const COLORS = {
  navy: '#002147',
  gold: '#D4AF37',
  paper: '#F4F4F0',
  white: '#FFFFFF',
  white: '#FFFFFF',
  muted: '#858580',
  deepDarkRed: '#550000',
  darkRed: '#8b0000',
  goldChampagne: '#F7E7CE',
};

const { width, height } = Dimensions.get('window');

export default function PlantelScreen() {
  const router = useRouter();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dadosEscalacao, setDadosEscalacao] = useState([]);
  const [confronto, setConfronto] = useState("MAR X ---");
  
  // Estados para o Modal de Detalhes
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);
  const [allPlayersList, setAllPlayersList] = useState([]);

  // Estados para Gamificação (Rating)
  const [ratingStatus, setRatingStatus] = useState("bloqueado");
  const [senhaValidacao, setSenhaValidacao] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationInput, setValidationInput] = useState("");
  
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [playerToRate, setPlayerToRate] = useState(null);
  const [currentRating, setCurrentRating] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Real-time Ranking State
  const [rankedPlayers, setRankedPlayers] = useState([]);

  useEffect(() => {
    const fetchConfronto = async () => {
      try {
        const jogoRef = doc(db, "proximo_jogo", "partida_atual");
        const jogoSnap = await getDoc(jogoRef);
        if (jogoSnap.exists()) {
          const data = jogoSnap.data();
          const extraHorario = data.horario ? ` • ${data.horario}` : (data.hora ? ` • ${data.hora}` : '');
          setConfronto(`${data.casa || "MAR"} X ${data.fora || "---"}${extraHorario}`);
          setRatingStatus(data.ratingStatus || 'bloqueado');
          setSenhaValidacao(data.senhaValidacao || '');
        }
      } catch(e) {
        console.error("Match Info Error:", e);
      }
    };
    fetchConfronto();

    const q = query(collection(db, "players"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const todosJogadores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Atualizar Categorias do Plantel
        const categorias = [
          { title: 'GOLEIROS', data: todosJogadores.filter(p => p.category === 'GOLEIRO') },
          { title: 'DEFESA', data: todosJogadores.filter(p => p.category === 'DEFESA') },
          { title: 'MEIO-CAMPO', data: todosJogadores.filter(p => p.category === 'MEIO') },
          { title: 'ATACANTES', data: todosJogadores.filter(p => p.category === 'ATAQUE') },
          { title: 'COMISSÃO TÉCNICA', data: todosJogadores.filter(p => p.category === 'COMISSÃO') },
        ];
        
        const validSections = categorias.filter(s => s.data.length > 0);
        setSections(validSections);
        setAllPlayersList(validSections.flatMap(s => s.data));

        // Atualizar Escalacao Tática
        const escalacaoRef = doc(db, "escalacao_atual", "campo_tatico");
        const escalacaoSnap = await getDoc(escalacaoRef);
        if (escalacaoSnap.exists()) {
          const idsTitulares = escalacaoSnap.data().titulares || [];
          const titularesOrdenados = idsTitulares.map(id => 
            todosJogadores.find(p => p.id.toLowerCase() === id.toLowerCase())
          ).filter(p => p !== undefined);
          setDadosEscalacao(titularesOrdenados);
        }

        // Processar Ranking ao Vivo (Apenas jogadores que receberam votos)
        const ranked = todosJogadores
          .filter(p => p.fanRatingCount > 0)
          .map(p => {
            const media = p.fanRatingSum / p.fanRatingCount;
            // Calcular procentagem em relacao a nota maxima (10)
            const percentage = Math.min((media / 10) * 100, 100);
            return {
              ...p,
              mediaScore: media.toFixed(1),
              percentage
            };
          })
          .sort((a, b) => b.mediaScore - a.mediaScore);
          
        setRankedPlayers(ranked);

      } catch (error) {
        console.error("Plantel onSnapshot Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const abrirPerfil = (player) => {
    const idx = allPlayersList.findIndex(p => p.id === player.id);
    setSelectedPlayerIndex(idx !== -1 ? idx : 0);
    setModalVisible(true);
  };

  // Gamificação - Clicks no Campo Tático
  const handleCampoClick = (player) => {
    if (ratingStatus !== 'liberado') {
      Alert.alert("Bloqueado 🔒", "A avaliação da torcida só será liberada após o fim da partida.");
      return;
    }
    
    // Always store the player they clicked on so we know who to rate
    setPlayerToRate(player); 

    if (!isUnlocked) {
      setValidationInput("");
      setValidationModalVisible(true);
      return;
    }
    abrirRatingModal(player);
  };

  const abrirRatingModal = (player) => {
    setPlayerToRate(player);
    setCurrentRating(10);
    setRatingModalVisible(true);
  };

  const validarSenha = () => {
    if (validationInput.trim().toLowerCase() === senhaValidacao.trim().toLowerCase()) {
      setIsUnlocked(true);
      setValidationModalVisible(false);
      // Aqui estava faltando abrir o modal de Rating logo após a senha estar correta
      if (playerToRate) {
        setTimeout(() => abrirRatingModal(playerToRate), 100); 
      }
    } else {
      Alert.alert("Acesso Negado", "Senha incorreta. Dica: Digite o placar exato (ex: 2x1).");
    }
  };

  const submitRating = async () => {
    if (!playerToRate) return;
    setIsSubmitting(true);
    try {
      const playerRef = doc(db, "players", playerToRate.id);
      await updateDoc(playerRef, {
        fanRatingSum: increment(currentRating),
        fanRatingCount: increment(1)
      });
      setRatingModalVisible(false);
      Alert.alert("Voto Registrado", `Você deu ${currentRating} para ${playerToRate.name?.split(' ')[0]}!`);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível registrar o voto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminReset = () => {
    Alert.alert(
      "Acesso da Diretoria ⚠️",
      "Deseja encerrar essa rodada de avaliações, arquivar os resultados e zerar as notas de todos os jogadores para o próximo jogo?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "ENCERRAR E ZERAR", style: "destructive", onPress: runAdminBatchReset }
      ]
    );
  };

  const runAdminBatchReset = async () => {
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Salvar no Histórico Permanente
      const historyRef = doc(collection(db, "historico_partidas"));
      batch.set(historyRef, {
        partida: confronto,
        data: new Date().toISOString(),
        top_players: rankedPlayers.slice(0, 10).map(p => ({
          name: p.name,
          media: p.mediaScore,
          votos: p.fanRatingCount
        }))
      });

      // 2. Zerar todos os jogadores do Plantel
      const playersSnap = await getDocs(collection(db, "players"));
      playersSnap.forEach((playerDoc) => {
        batch.update(playerDoc.ref, {
          fanRatingSum: 0,
          fanRatingCount: 0
        });
      });

      // 3. Bloquear próxima rodada no proximo_jogo
      const jogoRef = doc(db, "proximo_jogo", "partida_atual");
      batch.update(jogoRef, { ratingStatus: "bloqueado" });

      await batch.commit();
      
      Alert.alert("Sucesso", "A rodada foi encerrada, salva no histórico e os votos do time foram redefinidos para zero.");
      setRatingStatus("bloqueado");
      setIsUnlocked(false);

    } catch (error) {
      console.error("Batch Reset Error:", error);
      Alert.alert("Erro", "Falha ao executar a limpeza da nuvem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRankingListItem = ({ item, index }) => (
    <View style={styles.rankingItem}>
      <Text style={styles.rankingPos}>{index + 1}º</Text>
      <Image source={{ uri: item.img }} style={styles.rankingImg} />
      <View style={styles.rankingInfo}>
        <Text style={styles.rankingName}>{item.name?.toUpperCase()}</Text>
        <Text style={styles.rankingScore}>{item.mediaScore} • {item.fanRatingCount} {item.fanRatingCount === 1 ? 'voto': 'votos'}</Text>
        <View style={styles.rankingBarBg}>
          <View style={[styles.rankingBarFill, { width: `${item.percentage}%`, backgroundColor: item.percentage >= 80 ? '#4CAF50' : item.percentage >= 60 ? '#FFA500' : '#E53935' }]} />
        </View>
      </View>
    </View>
  );

  const renderPlayer = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerCard} 
      activeOpacity={0.8}
      onPress={() => abrirPerfil(item)}
    >
      <View style={styles.goldBar} />
      <Image source={{ uri: item.img }} style={styles.playerImage} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name?.toUpperCase()}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.playerPos}>{item.pos}  •  #{item.kit}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.category === 'COMISSÃO' ? 'STAFF' : 'VER PERFIL'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {loading ? (
        <ActivityIndicator color={COLORS.gold} size="large" style={{ flex: 1 }} />
      ) : modalVisible ? (
        <View style={styles.modalBg}>
          <FlatList
            data={allPlayersList}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedPlayerIndex}
            getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.swipePage}>
                
                {/* Conteúdo Principal do Jogador - FIFA Style Refined */}
                <ScrollView contentContainerStyle={styles.swipeContent} showsVerticalScrollIndicator={false}>
                  
                  {/* Container da Imagem com Nome Sobreposto (Gradient Fundo) */}
                  <LinearGradient 
                    colors={[COLORS.deepDarkRed, COLORS.darkRed]} 
                    style={styles.heroSection}
                  >
                    {/* Badge de Overall */}
                    <View style={styles.overallBadge}>
                      <View style={styles.overallScoreCell}>
                        <Text style={styles.overallText}>{item.overall || 85}</Text>
                      </View>
                      <View style={styles.overallLabelCell}>
                        <Text style={styles.overallLabel}>GERAL</Text>
                      </View>
                    </View>

                    {/* Nome Flutuante (Sobre a foto) */}
                    <View style={styles.floatingNameBlock}>
                      <Text style={styles.floatingFirstName}>
                        {item.firstName || item.name?.split(' ')[0]}
                      </Text>
                      <Text style={styles.floatingLastName}>
                        {item.lastName || item.name?.split(' ').slice(1).join(' ') || item.name?.split(' ')[0]}
                      </Text>
                    </View>

                    {/* Imagem do Jogador com Sombra Inferior */}
                    <View style={styles.imageWrapper}>
                       <Image source={{ uri: item.img }} style={styles.heroImg} resizeMode="cover" />
                       <LinearGradient 
                         colors={['transparent', COLORS.paper]} 
                         style={styles.imageShadow} 
                       />
                    </View>
                  </LinearGradient>
                  
                  {/* Controles e Informações Abaixo da Foto */}
                  <View style={styles.controlsRow}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.heroBackBtn}>
                      <Text style={styles.heroBackBtnText}>«</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.heroDetails}>
                      <Image source={require('../assets/images/icon-02.png')} style={styles.heroClubLogo} />
                      <View>
                        <Text style={styles.heroPos}>{item.pos?.toUpperCase()}</Text>
                        <Text style={styles.heroInfo}>{item.age || 25} ANOS • {item.value || '€ 1.5M'} • BRASIL</Text>
                      </View>
                    </View>
                  </View>

                  {/* BARRAS DE ATRIBUTOS (Progress Bars) */}
                  <View style={styles.attributesContainer}>
                    {[
                      { label: 'VELOCIDADE', value: item.stats_speed || 82 },
                      { label: 'CABECEIO / FÍSICO', value: item.stats_heading || 78 },
                      { label: 'TÉCNICA', value: item.stats_technique || 85 },
                      { label: 'DEFESA', value: item.stats_defense || 60 },
                      { label: 'PASSE / EQUIPE', value: item.stats_team || 80 },
                    ].map((attr, idx) => (
                      <View key={idx} style={styles.attrRow}>
                        <View style={styles.attrHeader}>
                          <Text style={styles.attrLabel}>{attr.label}</Text>
                          <Text style={styles.attrValueText}>{attr.value}</Text>
                        </View>
                        <View style={styles.attrBarBg}>
                          <View style={[styles.attrBarFill, { width: `${attr.value}%`, backgroundColor: attr.value > 80 ? '#c8f522' : '#FFA500' }]} />
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* CAIXAS DE ESTATÍSTICAS PRINCIPAIS (Fundo da tela) */}
                  <View style={styles.mainStatsRow}>
                    <LinearGradient colors={['#2A3F74', '#1A2345']} style={styles.mainStatBox}>
                      <Text style={styles.mainStatNumber}>{item.goals || 0}</Text>
                      <View style={styles.mainStatFooter}><Text style={styles.mainStatLabel}>GOLS</Text></View>
                    </LinearGradient>

                    <LinearGradient colors={['#2A3F74', '#1A2345']} style={styles.mainStatBox}>
                      <Text style={styles.mainStatNumber}>{item.assists || 0}</Text>
                      <View style={styles.mainStatFooter}><Text style={styles.mainStatLabel}>ASSISTÊNCIAS</Text></View>
                    </LinearGradient>
                  </View>

                  <View style={{ height: 40 }} />
                </ScrollView>

              </View>
            )}
          />
        </View>
      ) : (
        <SectionList
          ListHeaderComponent={
            // Admin Secret Button (Long Press on padding)
            <TouchableOpacity onLongPress={handleAdminReset} delayLongPress={2000} activeOpacity={1}>
              <View style={{ height: 10 }} />
            </TouchableOpacity>
          }
          ListFooterComponent={
            <View>
              <CampoTatico titulares={dadosEscalacao} confronto={confronto} onPlayerPress={handleCampoClick} />
              
              {/* Leaderboard ao Vivo */}
              {rankedPlayers.length > 0 && (
                <View style={styles.leaderboardContainer}>
                  <Text style={styles.leaderboardTitle}>🏆 RANKING DA TORCIDA (AO VIVO)</Text>
                  {rankedPlayers.map((p, index) => (
                    <React.Fragment key={p.id}>
                      {renderRankingListItem({ item: p, index })}
                    </React.Fragment>
                  ))}
                </View>
              )}
            </View>
          }
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}

      {!modalVisible && <View style={{ height: 100 }} />}

      {/* MODAL DE VALIDAÇÃO (CADEADO) */}
      <Modal visible={validationModalVisible} transparent animationType="fade">
        <View style={styles.modalLockOverlay}>
          <View style={styles.modalLockBox}>
            <Ionicons name="lock-closed" size={40} color={COLORS.navy} />
            <Text style={styles.lockTitle}>PROVE QUE VOCÊ ESTAVA LÁ</Text>
            <Text style={styles.lockSubtitle}>Digite a chave do jogo de hoje (ex: placar final) para avaliar.</Text>
            <TextInput 
              style={styles.lockInput}
              placeholder="Digite aqui..."
              placeholderTextColor="#999"
              value={validationInput}
              onChangeText={setValidationInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.lockBtnRow}>
              <TouchableOpacity style={styles.lockCancelBtn} onPress={() => setValidationModalVisible(false)}>
                <Text style={styles.lockCancelText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.lockConfirmBtn} onPress={validarSenha}>
                <Text style={styles.lockConfirmText}>LIBERAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE AVALIAÇÃO (RATING) */}
      <Modal visible={ratingModalVisible} transparent animationType="slide">
        <View style={styles.modalLockOverlay}>
          <View style={styles.ratingBox}>
            <TouchableOpacity style={styles.closeRatingBtn} onPress={() => setRatingModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.navy} />
            </TouchableOpacity>

            <Image source={{ uri: playerToRate?.img }} style={styles.ratingAvatar} />
            <Text style={styles.ratingPlayerName}>{playerToRate?.name?.toUpperCase()}</Text>
            
            <Text style={styles.ratingQuestion}>QUAL SUA NOTA?</Text>
            <Text style={styles.ratingScore}>{currentRating}</Text>

            <View style={styles.ratingControls}>
              <TouchableOpacity 
                style={styles.ratingMinus} 
                onPress={() => setCurrentRating(prev => Math.max(0, prev - 1))}
              >
                <Ionicons name="remove" size={30} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.ratingPlus} 
                onPress={() => setCurrentRating(prev => Math.min(10, prev + 1))}
              >
                <Ionicons name="add" size={30} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.submitRatingBtn, isSubmitting && { opacity: 0.5 }]} 
              onPress={submitRating}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.navy} size="small" />
              ) : (
                <Text style={styles.submitRatingText}>CONFIRMAR VOTO</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  listContent: { paddingBottom: 20 },
  sectionHeader: { fontSize: 13, fontWeight: '900', color: COLORS.deepDarkRed, marginLeft: 20, marginBottom: 15, marginTop: 20, letterSpacing: 1, opacity: 1 },
  playerCard: { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: 20, marginBottom: 12, borderRadius: 10, elevation: 4, overflow: 'hidden', alignItems: 'center' },
  goldBar: { width: 4, height: '100%', backgroundColor: COLORS.gold },
  playerImage: { width: 75, height: 75, backgroundColor: COLORS.deepDarkRed },
  playerInfo: { flex: 1, paddingHorizontal: 15 },
  playerName: { fontSize: 14, fontWeight: '900', color: COLORS.navy },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  playerPos: { fontSize: 10, color: COLORS.muted, fontWeight: '700' },
  statusBadge: { backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusText: { fontSize: 8, color: COLORS.gold, fontWeight: '900' },
  navWrapper: { position: 'absolute', bottom: 0, width: '100%', height: 100, backgroundColor: 'transparent', paddingBottom: 38 },

  // Estilos do Ranking Ao Vivo
  leaderboardContainer: { marginHorizontal: 20, marginTop: 10, marginBottom: 30, backgroundColor: COLORS.white, borderRadius: 12, padding: 15, elevation: 3 },
  leaderboardTitle: { fontSize: 13, fontWeight: '900', color: COLORS.navy, marginBottom: 15, textAlign: 'center', letterSpacing: 0.5 },
  rankingItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  rankingPos: { fontSize: 16, fontWeight: '900', color: COLORS.gold, width: 35 },
  rankingImg: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.paper, borderWidth: 1, borderColor: '#EEE' },
  rankingInfo: { flex: 1, marginLeft: 15 },
  rankingName: { fontSize: 12, fontWeight: '900', color: COLORS.navy },
  rankingScore: { fontSize: 10, fontWeight: '700', color: COLORS.muted, marginBottom: 4 },
  rankingBarBg: { height: 4, width: '100%', backgroundColor: '#EEE', borderRadius: 2, overflow: 'hidden' },
  rankingBarFill: { height: '100%', borderRadius: 2 },

  // Estilos do Modal Swipeable (Fifa/Nike Style)
  // Estilos do Modal Swipeable (Fifa/Nike Style Refined)
  modalBg: { flex: 1, backgroundColor: COLORS.paper },
  swipePage: { width: width, flex: 1, paddingTop: 0, paddingBottom: 60 },
  
  swipeContent: { paddingHorizontal: 0, paddingBottom: 50 },
  
  heroSection: { alignItems: 'center', width: '100%', paddingTop: 20 },
  overallBadge: { position: 'absolute', top: 30, right: 20, borderRadius: 10, overflow: 'hidden', elevation: 5, zIndex: 3, width: 55 },
  overallScoreCell: { backgroundColor: COLORS.goldChampagne, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  overallText: { fontSize: 24, fontWeight: '900', color: COLORS.navy, lineHeight: 26 },
  overallLabelCell: { backgroundColor: COLORS.gold, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  overallLabel: { fontSize: 9, fontWeight: '900', color: COLORS.navy },

  floatingNameBlock: { position: 'absolute', top: 160, left: 20, zIndex: 3 },
  floatingFirstName: { fontSize: 16, fontWeight: '500', color: COLORS.white, letterSpacing: 0.5, opacity: 0.9 },
  floatingLastName: { fontSize: 44, fontWeight: '900', color: COLORS.white, letterSpacing: 1, lineHeight: 45 },

  imageWrapper: { width: '100%', alignItems: 'center', overflow: 'hidden' },
  heroImg: { width: width * 0.75, height: width * 0.75, zIndex: 1 },
  imageShadow: { position: 'absolute', bottom: -2, left: 0, right: 0, height: 60, zIndex: 2 },

  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.paper, paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E5E0', zIndex: 4 },
  heroBackBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(0,33,71,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  heroBackBtnText: { color: COLORS.navy, fontSize: 24, fontWeight: '900', marginBottom: 2 },
  heroDetails: { flexDirection: 'row', alignItems: 'center' },
  heroClubLogo: { width: 35, height: 35, marginRight: 10, resizeMode: 'contain' },
  heroPos: { fontSize: 14, fontWeight: '900', color: COLORS.navy },
  heroInfo: { fontSize: 10, fontWeight: '700', color: COLORS.muted },

  attributesContainer: { width: '100%', paddingHorizontal: 20, marginTop: 25 },
  attrRow: { marginBottom: 15 },
  attrHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  attrLabel: { fontSize: 11, fontWeight: '600', color: COLORS.navy, letterSpacing: 0.5 },
  attrValueText: { fontSize: 13, fontWeight: '900', color: '#88C000' },
  attrBarBg: { width: '100%', height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, overflow: 'hidden' },
  attrBarFill: { height: '100%', borderRadius: 2 },

  mainStatsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, marginBottom: 25 },
  mainStatBox: { flex: 0.48, borderRadius: 8, overflow: 'hidden', elevation: 2 },
  mainStatNumber: { fontSize: 32, fontWeight: '900', color: COLORS.white, textAlign: 'center', paddingVertical: 15 },
  mainStatFooter: { backgroundColor: '#FFA500', paddingVertical: 6, alignItems: 'center' },
  mainStatLabel: { fontSize: 10, fontWeight: '900', color: '#1A2345', letterSpacing: 1 },

  // Estilos Modais de Gamificação
  modalLockOverlay: { flex: 1, backgroundColor: 'rgba(0,33,71,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalLockBox: { width: '100%', backgroundColor: COLORS.white, borderRadius: 15, padding: 25, alignItems: 'center', elevation: 10 },
  lockTitle: { fontSize: 13, fontWeight: '900', color: COLORS.navy, marginTop: 15, marginBottom: 5, letterSpacing: 1 },
  lockSubtitle: { fontSize: 10, color: COLORS.muted, textAlign: 'center', marginBottom: 20 },
  lockInput: { width: '100%', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16, textAlign: 'center', marginBottom: 20 },
  lockBtnRow: { flexDirection: 'row', gap: 10 },
  lockCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: '#EEE' },
  lockCancelText: { fontSize: 11, fontWeight: '900', color: COLORS.muted },
  lockConfirmBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.gold },
  lockConfirmText: { fontSize: 11, fontWeight: '900', color: COLORS.navy },

  ratingBox: { width: '100%', backgroundColor: COLORS.white, borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10 },
  closeRatingBtn: { position: 'absolute', top: 15, right: 15, padding: 5 },
  ratingAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.deepDarkRed, marginBottom: 15, borderWidth: 2, borderColor: COLORS.gold },
  ratingPlayerName: { fontSize: 18, fontWeight: '900', color: COLORS.navy, marginBottom: 20, textAlign: 'center' },
  ratingQuestion: { fontSize: 10, color: COLORS.muted, fontWeight: '900', letterSpacing: 1 },
  ratingScore: { fontSize: 60, fontWeight: '900', color: COLORS.navy, marginVertical: 10 },
  ratingControls: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  ratingMinus: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.darkRed, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  ratingPlus: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  submitRatingBtn: { width: '100%', backgroundColor: COLORS.gold, paddingVertical: 15, borderRadius: 10, alignItems: 'center', elevation: 3 },
  submitRatingText: { fontSize: 14, fontWeight: '900', color: COLORS.navy, letterSpacing: 1 }
});
