import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../src/config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { getOptimizedImage } from '../src/utils/imageProxy';

const { width } = Dimensions.get('window');
const COLORS = {
  navy: '#002147',
  gold: '#D4AF37',
  paper: '#F4F4F0',
  white: '#FFFFFF',
  goldChampagne: '#E8D4A2',
  deepDarkRed: '#550000'
};

export default function ClubeScreen() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const fetchClubeBanners = async () => {
      try {
        const q = query(collection(db, "clube_banners"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBanners(list);
      } catch (error) {
        console.error("Erro ao carregar banners do clube:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubeBanners();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLogged(!!user);
    });
    return () => unsubscribe();
  }, []);

  const BannerCard = ({ item }) => {
    const isSpecial = item.id === 'socio' || item.id === 'planos';
    const isSponsor = item.categoria && item.categoria.toUpperCase() === 'PATROCINADORES';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.bannerContainer,
          isSpecial && styles.goldBorder,
          isSponsor && { height: 220 }
        ]}
        onPress={() => {
          if (item.id === 'socio') {
            router.push(isLogged ? '/PortalSocioScreen' : '/SocioInfoScreen');
          }
          else if (item.screen === 'Template') {
            router.push({
              pathname: '/TemplateScreen',
              params: {
                title: item.title,
                sub: item.sub,
                image: item.image,
                content: item.textoLongo
              }
            });
          }
          else if (item.screen) {
            router.push(`/${item.screen}Screen`);
          }
        }}
      >
        <ImageBackground
          source={{ uri: getOptimizedImage(item.image) }}
          style={styles.image}
          imageStyle={{ borderRadius: 10, resizeMode: isSponsor ? 'contain' : 'cover' }}
        >
          {item.categoria && (
            <View style={styles.labelBadge}>
              <Text style={styles.labelText}>{item.categoria.toUpperCase()}</Text>
            </View>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,33,71,0.95)']}
            style={styles.gradient}
          >
            <View style={styles.footerRow}>
              <View style={styles.textWrapper}>
                <Text style={[styles.title, isSpecial && { color: COLORS.gold }]}>
                  {item.title?.toUpperCase()}
                </Text>
                <Text style={styles.subtitle}>{item.sub}</Text>
              </View>

              <Ionicons
                name={isSpecial ? "star" : "chevron-forward-circle"}
                size={24}
                color={isSpecial ? COLORS.gold : COLORS.white}
                style={{ opacity: 0.8 }}
              />
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>CONHEÇA MELHOR SEU CLUBE</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.gold} size="large" />
          </View>
        ) : (
          banners.map((item) => (
            <BannerCard key={item.id} item={item} />
          ))
        )}

        {/* Espaçamento para não cobrir o último card com a navbar */}
        <View style={{ height: 110 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 20, paddingTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: COLORS.deepDarkRed, marginLeft: 20, marginBottom: 10, marginTop: 10, letterSpacing: 1, opacity: 1 },
  loadingContainer: { marginTop: 50, alignItems: 'center' },
  bannerContainer: {
    height: 170,
    marginHorizontal: 20,
    marginVertical: 10,
    elevation: 4,
    borderRadius: 10,
    backgroundColor: '#CCC',
  },
  goldBorder: { borderWidth: 2, borderColor: COLORS.gold },
  image: { flex: 1, justifyContent: 'flex-end' },
  labelBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(0,33,71,0.85)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
    borderWidth: 0.5, borderColor: COLORS.gold,
  },
  labelText: { color: COLORS.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  gradient: { height: '80%', width: '100%', justifyContent: 'flex-end', padding: 15 },
  footerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  textWrapper: { borderLeftWidth: 3, borderLeftColor: COLORS.gold, paddingLeft: 12, flex: 1 },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { color: COLORS.white, fontSize: 11, fontWeight: '600', opacity: 0.8, marginTop: 2 },
  navWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'transparent'
  }
});
