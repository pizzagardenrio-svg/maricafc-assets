import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, StatusBar, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const { width } = Dimensions.get('window');
const COLORS = {
  navy: '#002147',
  gold: '#D4AF37',
  paper: '#F4F4F0',
  white: '#FFFFFF',
  muted: '#858580',
  deepDarkRed: '#550000',
};

export default function SocioInfoScreen() {
  const router = useRouter();
  const [selectedBenefit, setSelectedBenefit] = useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/PortalSocioScreen');
      }
    });
    return unsubscribe;
  }, []);

  const benefits = [
    { title: "INGRESSOS", icon: "ticket", desc: "Entrada gratuita ou com grandes descontos nos jogos físicos e mando de campo do Maricá FC." },
    { title: "LOJA EXCLUSIVA", icon: "shirt", desc: "Compre o novo manto, peças do clube e artigos de colecionador premium com prioridade antes de todos." },
    { title: "BASTIDORES", icon: "people", desc: "Acesso a conteúdos internos, entrevistas pós-jogo e avaliações que moldam diretamente o time." },
    { title: "EXPERIÊNCIAS", icon: "trophy", desc: "Participe de sorteios vips mensais, visitas ao CT, idas ao vestiário e encontros com seus jogadores favoritos." }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* HERO BANNER SECTION */}
        <View style={styles.heroContainer}>
          <Image
            source={require('../assets/images/camisa.png')}
            style={styles.heroBg}
            resizeMode="cover"
            blurRadius={4}
          />
          <View style={styles.overlay} />
          <View style={styles.heroContent}>
            <Image source={require('../assets/images/logo-star.png')} style={styles.starLogo} resizeMode="contain" />
            <Text style={styles.heroTitle}>A FORÇA DO MARICÁ.</Text>
            <Text style={styles.heroSubtitle}>Faça parte da história do clube que mais cresce no estado. Apoie, economize e tenha acesso exclusivo.</Text>
          </View>
        </View>

        {/* BENEFIT ICONS */}
        <View style={styles.benefitsWrapper}>
          <Text style={styles.sectionTitle}>POR QUE SER SÓCIO?</Text>

          <View style={styles.benefitRow}>
            {benefits.slice(0, 2).map((b, i) => (
              <TouchableOpacity key={i} style={styles.benefitItem} onPress={() => setSelectedBenefit(b)} activeOpacity={0.8}>
                <View style={styles.iconCircle}><Ionicons name={b.icon} size={24} color={COLORS.gold} /></View>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc} numberOfLines={2}>{b.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.benefitRow}>
            {benefits.slice(2, 4).map((b, i) => (
              <TouchableOpacity key={i} style={styles.benefitItem} onPress={() => setSelectedBenefit(b)} activeOpacity={0.8}>
                <View style={styles.iconCircle}><Ionicons name={b.icon} size={24} color={COLORS.gold} /></View>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc} numberOfLines={2}>{b.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CALL TO ACTION */}
        <LinearGradient
          colors={[COLORS.navy, '#1A365D']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.ctaBox}
        >
          <Text style={styles.ctaHead}>A HORA É AGORA</Text>
          <Text style={styles.ctaBody}>Escolha o plano que mais combina com você e seu estilo de arquibancada a partir de centavos por dia.</Text>

          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/PlanosScreen')}>
            <Text style={styles.ctaText}>PLANOS DISPONÍVEIS</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.navy} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryLoginBtn} onPress={() => router.replace('/')}>
            <Text style={styles.secondaryLoginText}>JÁ É SÓCIO? <Text style={{ fontWeight: '900', textDecorationLine: 'underline' }}>ENTRAR NA CONTA</Text></Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* POP-UP (MODAL) DE LER MAIS BENEFICIO */}
      <Modal visible={!!selectedBenefit} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedBenefit && (
              <>
                <View style={[styles.iconCircle, { width: 70, height: 70, borderRadius: 35, marginBottom: 20 }]}>
                  <Ionicons name={selectedBenefit.icon} size={35} color={COLORS.gold} />
                </View>
                <Text style={[styles.benefitTitle, { fontSize: 18, marginBottom: 15 }]}>{selectedBenefit.title}</Text>
                <Text style={[styles.benefitDesc, { fontSize: 14, lineHeight: 22, opacity: 1, color: COLORS.navy }]}>{selectedBenefit.desc}</Text>
                
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedBenefit(null)}>
                  <Text style={styles.modalCloseText}>FECHAR</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 0 },

  heroContainer: { width: '100%', height: 230, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  heroBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,33,71,0.85)' },
  heroContent: { paddingHorizontal: 30, alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.white, textAlign: 'center', letterSpacing: 2, marginBottom: 10 },
  heroSubtitle: { fontSize: 13, color: '#DDD', textAlign: 'center', lineHeight: 20, fontWeight: '500' },
  starLogo: { width: 45, height: 45, marginBottom: 15, tintColor: COLORS.gold },

  benefitsWrapper: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 25 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.deepDarkRed, letterSpacing: 1, marginBottom: 25, textAlign: 'center' },
  benefitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  benefitItem: { width: '48%', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(212,175,55,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  benefitTitle: { fontSize: 11, fontWeight: '900', color: COLORS.navy, letterSpacing: 0.5, marginBottom: 5, textAlign: 'center' },
  benefitDesc: { fontSize: 9, color: COLORS.muted, textAlign: 'center', lineHeight: 14 },

  ctaBox: { marginHorizontal: 20, borderRadius: 16, padding: 25, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, marginBottom: 20 },
  ctaHead: { fontSize: 18, fontWeight: '900', color: COLORS.gold, letterSpacing: 1, marginBottom: 10 },
  ctaBody: { fontSize: 12, color: COLORS.white, textAlign: 'center', lineHeight: 18, marginBottom: 25, opacity: 0.9 },
  ctaBtn: { flexDirection: 'row', backgroundColor: COLORS.gold, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', width: '100%' },
  ctaText: { fontWeight: '900', fontSize: 11, color: COLORS.navy, letterSpacing: 1, marginRight: 8 },

  secondaryLoginBtn: { marginTop: 20, padding: 10 },
  secondaryLoginText: { color: COLORS.white, fontSize: 11, fontWeight: '600', opacity: 0.8, letterSpacing: 1 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,33,71,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  modalBox: { backgroundColor: COLORS.white, width: '100%', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  modalCloseBtn: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 35, backgroundColor: COLORS.paper, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
  modalCloseText: { fontSize: 12, fontWeight: '900', color: COLORS.navy, letterSpacing: 1 }
});
