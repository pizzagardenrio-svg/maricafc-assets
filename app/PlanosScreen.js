import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  FlatList, ActivityIndicator, Animated, Dimensions, Alert, StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../src/config/firebase'; 
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const COLORS = { 
  navy: '#002147', 
  gold: '#D4AF37', 
  paper: '#F4F4F0', 
  white: '#FFFFFF', 
  muted: '#858580',
  deepDarkRed: '#550000',
};

export default function PlanosScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const moveAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Busca os planos
        const querySnapshot = await getDocs(collection(db, "membership_plans"));
        const plansList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlans(plansList.sort((a, b) => Number(a.precoMensal) - Number(b.precoMensal)));

        // 2. Busca perfil do usuário logado
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) setUserProfile(userDoc.data());
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Loop da animação de brilho (Shimmer)
    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(moveAnim, { toValue: width, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []); // <--- CORREÇÃO: Removido o 'navigation' daqui

  // FUNÇÃO DE AÇÃO DO BOTÃO (INTELIGENTE)
  const handlePlanAction = (item) => {
    if (!auth.currentUser) {
      // Caso 1: Não logado
      Alert.alert("Acesso Restrito", "Faça login para aderir a um plano.", [
        { text: "Depois", style: "cancel" },
        { text: "FAZER LOGIN", onPress: () => router.push({ pathname: '/', params: { destino: 'Planos' } }) }
      ]);
      return;
    }

    // Caso 2: Já é sócio (Possui nível diferente de NONE ou Vazio)
    if (userProfile?.membershipLevel && userProfile?.membershipLevel !== 'NONE') {
      router.push('/PortalSocio'); 
    } else {
      // Caso 3: Logado mas não é sócio ainda
      Alert.alert(
        "Sócio Tsunami", 
        `Deseja iniciar sua adesão ao ${item.nome}?`,
        [
          { text: "Depois", style: "cancel" },
          { text: "ASSINAR AGORA", onPress: () => Alert.alert("Sucesso", "Redirecionando para o pagamento...") }
        ]
      );
    }
  };

  const renderPlan = ({ item }) => {
    const mensal = Number(item.precoMensal || 0);
    const anual = Number(item.precoAnual || 0);
    const precoExibido = isAnnual ? (anual / 12) : mensal; 
    const gradients = {
      ouro: ['#D4AF37', '#AA7B18', '#D4AF37'],
      prata: ['#E0E0E0', '#BDBDBD', '#E0E0E0'],
      diamante: ['#002147', '#1E3A8A', '#002147'] 
    };

    let cardGradient = gradients.ouro;
    if (item.nome?.toLowerCase().includes('prata')) cardGradient = gradients.prata;
    if (item.nome?.toLowerCase().includes('diamante')) cardGradient = gradients.diamante;

    const isOuro = item.nome?.toLowerCase().includes('ouro');
    const corPlano = item.cor || COLORS.gold;

    return (
      <View style={[styles.planCard, { borderColor: corPlano, borderWidth: isOuro ? 2 : 1 }]}>
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        
        {isOuro && (
          <Animated.View style={[styles.shimmerWrapper, { transform: [{ translateX: moveAnim }, { rotate: '25deg' }] }]}>
            <LinearGradient colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
          </Animated.View>
        )}

        <View style={styles.cardInner}>
          <Text style={[styles.planType, { color: corPlano }]}>{item.nome?.toUpperCase()}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>R$</Text>
            <Text style={styles.priceValue}>{precoExibido.toFixed(2).split('.')[0]}</Text>
            <View>
              <Text style={styles.priceCents}>,{precoExibido.toFixed(2).split('.')[1]}</Text>
              <Text style={styles.period}>/MÊS</Text>
            </View>
          </View>

          {isAnnual && <Text style={styles.annualInfo}>Economia de 20% no plano anual</Text>}

          <View style={styles.benefitList}>
            {item.beneficios?.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Ionicons name="shield-checkmark" size={14} color={corPlano} />
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.selectBtn, { backgroundColor: isOuro ? COLORS.navy : COLORS.white }]} 
            onPress={() => handlePlanAction(item)}
          >
            <Text style={[styles.selectBtnText, { color: isOuro ? COLORS.white : COLORS.navy }]}>
              {userProfile?.membershipLevel && userProfile?.membershipLevel !== 'NONE' ? "VER MEU PERFIL" : "QUERO SER SÓCIO"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>ESCOLHA SEU PLANO</Text>
        <View style={styles.selectorContainer}>
          <TouchableOpacity style={[styles.selBtn, !isAnnual && styles.selBtnActive]} onPress={() => setIsAnnual(false)}>
            <Text style={[styles.selText, !isAnnual && styles.selTextActive]}>MENSAL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.selBtn, isAnnual && styles.selBtnActive]} onPress={() => setIsAnnual(true)}>
            <Text style={[styles.selText, isAnnual && styles.selTextActive]}>ANUAL (-20%)</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.gold} size="large" style={{ marginTop: 50 }} />
        ) : (
          <FlatList 
            horizontal
            showsHorizontalScrollIndicator={false}
            data={plans} 
            renderItem={renderPlan} 
            keyExtractor={item => item.id} 
            initialScrollIndex={1}
            getItemLayout={(data, index) => ({
              length: width * 0.85 + 20,
              offset: (width * 0.85 + 20) * index,
              index,
            })}
            snapToInterval={width * 0.85 + 20}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: (width * 0.15) / 2 - 10 }}
          />
        )}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: COLORS.deepDarkRed, marginLeft: 20, marginBottom: 15, marginTop: 20, letterSpacing: 1, opacity: 1 },
  selectorContainer: { flexDirection: 'row', backgroundColor: '#E5E5E0', borderRadius: 12, padding: 4, marginHorizontal: 20, marginBottom: 25 },
  selBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  selBtnActive: { backgroundColor: COLORS.white, elevation: 3 },
  selText: { fontSize: 11, fontWeight: '700', color: COLORS.muted },
  selTextActive: { color: COLORS.navy },
  planCard: { backgroundColor: COLORS.white, borderRadius: 10, marginHorizontal: 10, width: width * 0.85, marginBottom: 20, overflow: 'hidden', elevation: 5 },
  shimmerWrapper: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 },
  cardInner: { padding: 25, backgroundColor: 'rgba(255,255,255,0.7)', flex: 1 },
  planType: { fontSize: 18, fontWeight: '900', marginBottom: 15, letterSpacing: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 },
  currency: { fontSize: 14, color: COLORS.navy, fontWeight: '700', marginTop: 5, marginRight: 2 },
  priceValue: { fontSize: 42, color: COLORS.navy, fontWeight: '900' },
  priceCents: { fontSize: 16, color: COLORS.navy, fontWeight: '700', marginTop: 8 },
  period: { fontSize: 10, color: COLORS.muted, fontWeight: '900' },
  annualInfo: { fontSize: 10, color: '#4CAF50', fontWeight: 'bold', marginBottom: 15 },
  benefitList: { marginVertical: 15 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  benefitText: { fontSize: 13, color: COLORS.navy, marginLeft: 10, fontWeight: '500' },
  selectBtn: { height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
  selectBtnText: { fontWeight: '900', fontSize: 11, letterSpacing: 1 }
});
