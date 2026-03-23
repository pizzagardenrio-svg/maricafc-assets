import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Linking, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../src/context/DataContext';
import { getOptimizedImage } from '../src/utils/imageProxy';

// Componentes
import CardProximoJogo from '../src/components/CardProximoJogo';
import AdBanner from '../src/components/AdBanner';

const COLORS = {
  navy:        '#002147',
  white:       '#FFFFFF',
  darkRed:     '#880000',
  deepDarkRed: '#550000',
  gold:        '#D4AF37',
  paper:       '#F4F4F0',
};

export default function HQMaricaScreen() {
  const router = useRouter();
  const { maricaNews, loadingMarica, cariocaNews, loadingCarioca, formatTimeAgo } = useData();

  // ─── Guard: DataContext ainda não está pronto ────────────────────────────
  // Se o hook retornar undefined (ex.: componente montado fora do Provider
  // ou Provider ainda inicializando), evita tela branca mostrando um loader.
  if (!maricaNews || !cariocaNews) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Próximo Jogo ── */}
        <View style={styles.bannerWrapper}>
          <CardProximoJogo />
        </View>

        {/* ── Notícias Oficiais do Maricá FC ── */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>ÚLTIMAS NOTÍCIAS | MARICÁ FC</Text>

          {loadingMarica && maricaNews.length === 0 ? (
            <ActivityIndicator color={COLORS.gold} size="large" style={{ marginTop: 10 }} />
          ) : maricaNews.length > 0 ? (
            maricaNews.map((item, index) => (
              <TouchableOpacity
                key={`marica-${index}`}
                style={styles.newsCard}
                onPress={() => item.link && Linking.openURL(item.link)}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: item.image_url
                      || 'https://maricafutebolclube.com/wp-content/uploads/2021/05/logo_maricafc-01-370x370.png'
                  }}
                  style={styles.newsImg}
                  resizeMode="cover"
                />
                <View style={styles.textWrapper}>
                  <Text style={[styles.newsTag, { color: COLORS.navy }]}>
                    OFICIAL • {formatTimeAgo(item.pubDate)}
                  </Text>
                  <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Site Oficial Indisponível.</Text>
          )}
        </View>

        {/* ── Radar do Futebol Carioca ── */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>RADAR DO FUTEBOL CARIOCA</Text>

          {loadingCarioca && cariocaNews.length === 0 ? (
            <ActivityIndicator color={COLORS.darkRed} size="large" style={{ marginTop: 10 }} />
          ) : cariocaNews.length > 0 ? (
            cariocaNews.map((item, index) => (
              <TouchableOpacity
                key={`carioca-${index}`}
                style={[styles.newsCard, { borderLeftColor: COLORS.darkRed }]}
                onPress={() => item.link && Linking.openURL(item.link)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: getOptimizedImage(item.image_url) || 'https://picsum.photos/200' }}
                  style={styles.newsImg}
                  resizeMode="cover"
                />
                <View style={styles.textWrapper}>
                  <Text style={styles.newsTag}>
                    MÍDIA • {formatTimeAgo(item.pubDate)}
                  </Text>
                  <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma notícia disponível.</Text>
          )}
        </View>

        <AdBanner />
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Loader de segurança (DataContext não pronto)
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container:    { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingTop: 0 },
  bannerWrapper: { width: '100%' },

  sectionTitle: {
    fontSize: 13, fontWeight: '900', color: COLORS.deepDarkRed,
    marginLeft: 20, marginBottom: 15, marginTop: 20,
    letterSpacing: 1,
  },
  newsSection: { paddingBottom: 10 },

  newsCard: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    marginHorizontal: 20, marginBottom: 15, borderRadius: 12,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 5,
    overflow: 'hidden', borderLeftWidth: 4, borderLeftColor: COLORS.gold,
  },
  newsImg:     { width: 110, height: 110, backgroundColor: '#EEE' },
  textWrapper: { flex: 1, padding: 12, justifyContent: 'center' },
  newsTag:     { fontSize: 8, fontWeight: '900', color: COLORS.darkRed, marginBottom: 4, letterSpacing: 1 },
  newsTitle:   { fontSize: 13, fontWeight: '800', color: COLORS.navy, lineHeight: 18 },

  emptyText: { textAlign: 'center', color: '#888', fontSize: 11, marginTop: 10 },
});
