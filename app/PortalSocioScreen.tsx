import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, StatusBar, Linking 
} from 'react-native';
import { auth, db } from '../src/config/firebase'; 
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore'; 
import QRCode from 'react-native-qrcode-svg'; 
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOptimizedImage } from '../src/utils/imageProxy';

const COLORS = {
  navy: '#002147', gold: '#D4AF37', paper: '#F4F4F0', goldLight: '#E8D4A2',
  white: '#FFFFFF', muted: '#858580', success: '#4CAF50', darkRed: '#880000',
  deepDarkRed: '#550000'
};

export default function PortalSocioScreen() {
  const router = useRouter();
  const [nomeReal, setNomeReal] = useState('CARREGANDO...');
  const [dadosSocio, setDadosSocio] = useState(null);
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para abrir WhatsApp (Venda de Ingressos/Loja)
  const handleWhatsApp = (tipo) => {
    const msg = tipo === 'loja' 
      ? `Olá! Sou sócio ${dadosSocio?.membershipLevel || 'OURO'} e gostaria de ver os produtos com desconto.`
      : `Olá! Gostaria de reservar meu ingresso com desconto de sócio para o próximo jogo.`;
    const fone = "5521999999999"; // COLOQUE O NÚMERO DO MARICÁ FC AQUI
    Linking.openURL(`whatsapp://send?phone=${fone}&text=${msg}`);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid); 
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const dados = docSnap.data();
            setDadosSocio(dados);
            setNomeReal((dados.fullName || dados.nome || 'SÓCIO TORCEDOR').toUpperCase());
          }
          const q = query(collection(db, "socio_parceiros"), orderBy("order", "asc"));
          const snap = await getDocs(q);
          setParceiros(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        router.replace('/');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={COLORS.gold} size="large" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.content}>
            
            {/* CARTEIRINHA PREMIUM */}
            <View style={styles.idCard}>
              <View style={styles.cardHeader}>
                <Image source={require('../assets/images/icon-02.png')} style={styles.cardLogo} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardBrand}>MARICÁ FC</Text>
                  <Text style={styles.cardLevel}>SÓCIO {dadosSocio?.membershipLevel?.toUpperCase() || 'OURO'}</Text>
                </View>
                <View style={styles.statusBadge}><Text style={styles.statusText}>● ATIVO</Text></View>
              </View>

              <View style={styles.cardBody}>
                <Image 
                  source={dadosSocio?.photoURL ? { uri: getOptimizedImage(dadosSocio.photoURL) } : require('../assets/images/icon.png')} 
                  style={styles.userPhoto}
                />
                <View style={styles.userData}>
                  <Text style={styles.label}>NOME DO TITULAR</Text>
                  <Text style={styles.userName}>{nomeReal}</Text>
                  
                  {/* BOTÕES DE AÇÃO INTERNOS (ESTILO OURO) */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.goldBtn} onPress={() => handleWhatsApp('loja')}>
                      <Ionicons name="cart" size={14} color={COLORS.navy} />
                      <Text style={styles.goldBtnText}>LOJA SÓCIO</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.goldBtn} onPress={() => handleWhatsApp('ingresso')}>
                      <Ionicons name="ticket" size={14} color={COLORS.navy} />
                      <Text style={styles.goldBtnText}>INGRESSOS</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.qrBox}>
                  <QRCode value={auth.currentUser?.uid} size={60} color={COLORS.navy} quietZone={2} />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>MATRÍCULA: #{auth.currentUser?.uid?.substring(0,6).toUpperCase()}</Text>
                  <Text style={styles.validityDate}>VALIDADE: {dadosSocio?.validade || '12/2026'}</Text>
                </View>
              </View>
            </View>

            {/* LISTA DE VANTAGENS ESTILIZADA */}
            <View style={styles.benefitsSection}>
               <Text style={styles.sectionTitle}>VANTAGENS DO SEU PLANO</Text>
               <View style={styles.benefitList}>
                 <Text style={styles.benefitText}>• Acesso prioritário e gratuito em jogos em casa</Text>
                 <Text style={styles.benefitText}>• Desconto de 15% em toda a linha oficial</Text>
                 <Text style={styles.benefitText}>• Rede de mais de 50 parceiros com descontos</Text>
                 <Text style={styles.benefitText}>• Sorteio mensal de camisas autografadas</Text>
               </View>
            </View>

            <Text style={styles.sectionTitle}>REDE DE PARCEIROS</Text>
            {parceiros.map(item => (
              <View key={item.id} style={styles.partnerCard}>
                <Image source={{ uri: getOptimizedImage(item.img) }} style={styles.partnerLogo} resizeMode="contain" />
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>{item.nome}</Text>
                  <Text style={styles.discountText}>{item.desconto}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
              </View>
            ))}

            <TouchableOpacity style={styles.logoutBtn} onPress={() => auth.signOut().then(() => router.replace('/'))}>
              <Text style={styles.logoutText}>SAIR DA CONTA</Text>
            </TouchableOpacity>
            <View style={{ height: 120 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingTop: 20 },
  idCard: { backgroundColor: COLORS.navy, marginHorizontal: 20, borderRadius: 20, padding: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardLogo: { width: 35, height: 35, marginRight: 12 },
  cardBrand: { color: COLORS.white, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  cardLevel: { color: COLORS.gold, fontSize: 10, fontWeight: '700' },
  statusBadge: { backgroundColor: 'rgba(76, 175, 80, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#4CAF50', fontSize: 8, fontWeight: '900' },
  cardBody: { flexDirection: 'row', marginBottom: 20 },
  userPhoto: { width: 90, height: 110, borderRadius: 12, backgroundColor: '#1a3a5a' },
  userData: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '700', marginBottom: 2 },
  userName: { color: COLORS.white, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  goldBtn: { backgroundColor: COLORS.gold, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, gap: 4 },
  goldBtnText: { color: COLORS.navy, fontSize: 8, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 15 },
  qrBox: { backgroundColor: COLORS.white, padding: 5, borderRadius: 8 },
  validityDate: { color: COLORS.white, fontSize: 12, fontWeight: '900' },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: COLORS.deepDarkRed, marginLeft: 20, marginBottom: 15, marginTop: 20, letterSpacing: 1, opacity: 1 },
  benefitsSection: { backgroundColor: COLORS.white, marginHorizontal: 20, borderRadius: 15, padding: 20, marginTop: 10 },
  benefitList: { gap: 10 },
  benefitText: { fontSize: 12, color: COLORS.navy, fontWeight: '600', opacity: 0.8 },
  partnerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 15, marginHorizontal: 20, marginBottom: 10 },
  partnerLogo: { width: 50, height: 50 },
  partnerInfo: { flex: 1, marginLeft: 15 },
  partnerName: { fontSize: 14, fontWeight: '800', color: COLORS.navy },
  discountText: { fontSize: 12, fontWeight: '700', color: COLORS.darkRed },
  logoutBtn: { marginTop: 30, alignItems: 'center' },
  logoutText: { color: COLORS.darkRed, fontSize: 10, fontWeight: '900', textDecorationLine: 'underline' }
});
