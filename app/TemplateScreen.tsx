import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  Dimensions, StatusBar, TouchableOpacity, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AdBanner from '../src/components/AdBanner';

const { width } = Dimensions.get('window');
const COLORS = {
  navy: '#002147',
  gold: '#D4AF37',
  paper: '#F4F4F0',
  white: '#FFFFFF',
  goldChampagne: '#E8D4A2'
};

export default function TemplateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
   // Recebe os dados da tela anterior (Firebase ou estático)
   const { title, sub, image, content } = params || {};

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 1. IMAGEM HERO COM DEGRADÊ */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: image || 'https://picsum.photos' }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,33,71,0.8)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroTextWrapper}>
            <Text style={styles.categoryTag}>{sub?.toUpperCase() || 'MARICÁ FC'}</Text>
            <Text style={styles.mainTitle}>{title?.toUpperCase() || 'TÍTULO DA PÁGINA'}</Text>
          </View>
        </View>

        {/* 2. CORPO EDITORIAL */}
        <View style={styles.bodyContent}>
          <Text style={styles.mainParagraph}>
            {content || "Carregando conteúdo informativo..."}
          </Text>

          {/* 3. INTERRUPÇÃO COMERCIAL (O PULO DO GATO PARA VENDER) */}
          <AdBanner />

          {/* ESPAÇO PARA MAIS TEXTO OU CONCLUSÃO */}
          <Text style={styles.secondaryText}>
            Acompanhe todas as novidades do Tsunami da Baixada diretamente no nosso App oficial.
            Seja sócio e ajude o Maricá FC a chegar ao topo!
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  scrollContent: { paddingTop: 0 },

  heroWrapper: { width: width, height: 350, backgroundColor: COLORS.navy },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroTextWrapper: { position: 'absolute', bottom: 30, left: 25, right: 25 },
  categoryTag: { color: COLORS.goldChampagne, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  mainTitle: { color: COLORS.white, fontSize: 26, fontWeight: '900', lineHeight: 30 },

  bodyContent: { paddingHorizontal: 25, paddingTop: 30 },
  mainParagraph: { fontSize: 17, color: '#333', lineHeight: 26, fontWeight: '400', marginBottom: 30 },
  secondaryText: { fontSize: 15, color: '#666', lineHeight: 24, fontStyle: 'italic', marginBottom: 20 },

  secondaryText: { fontSize: 13, color: COLORS.muted, lineHeight: 20, textAlign: 'center', marginTop: 10, paddingHorizontal: 15, fontStyle: 'italic' },

  navWrapper: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'transparent' }
});
