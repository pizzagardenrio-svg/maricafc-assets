import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Animated, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const COLORS = { navy: '#002147', gold: '#D4AF37' };

export default function CardProximoJogo() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchNextGame = async () => {
      try {
        const docRef = doc(db, "proximo_jogo", "partida_atual");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setGame(docSnap.data());
      } catch (error) { console.error("Erro Firebase:", error); }
      finally { setLoading(false); }
    };
    fetchNextGame();
  }, []);

  useEffect(() => {
    if (game?.fotosBanner?.length > 1) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2500, // Suave
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % game.fotosBanner.length);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [game, index]);

  useEffect(() => {
    if (game?.fotosBanner?.length > 1) {
      const breathingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 12000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 12000,
            useNativeDriver: true,
          })
        ])
      );
      breathingLoop.start();
      return () => breathingLoop.stop();
    }
  }, [game]);

  if (loading) return <View style={styles.loader}><ActivityIndicator color={COLORS.gold} size="large" /></View>;

  const fotos = game?.fotosBanner || [game?.bgImage];
  const prevIdx = (index - 1 + fotos.length) % fotos.length;

  return (
    <View style={styles.cardContainer}>
      <Animated.View style={[styles.absoluteImage, { transform: [{ scale: scaleAnim }] }]}>
        <Image 
          source={{ uri: fotos[prevIdx] }} 
          style={styles.imgStatic} 
          resizeMode="cover" 
        />
        <Animated.View style={[styles.absoluteImage, { opacity: fadeAnim }]}>
          <Image 
            source={{ uri: fotos[index] }} 
            style={styles.imgStatic} 
            resizeMode="cover" 
          />
        </Animated.View>
      </Animated.View>

      <LinearGradient 
        colors={['transparent', 'rgba(0,33,71,0.6)']} 
        style={styles.gradient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { height: 230, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  cardContainer: { width: width, height: 230, backgroundColor: '#000', overflow: 'hidden' },
  absoluteImage: { ...StyleSheet.absoluteFillObject },
  imgStatic: { width: '100%', height: '100%' },
  gradient: { ...StyleSheet.absoluteFillObject },
});
