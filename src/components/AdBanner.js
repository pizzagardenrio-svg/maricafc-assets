import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, TouchableOpacity, 
  StyleSheet, Dimensions, Linking, Animated 
} from 'react-native';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const LOCAL_BANNERS = [
  { id: 'l1', imageUrl: require('../../assets/images/sponsorBanner-01.png'), linkUrl: 'https://maricafutebolclube.com' },
  { id: 'l2', imageUrl: require('../../assets/images/sponsorBanner-02.png'), linkUrl: 'https://maricafutebolclube.com' },
  { id: 'l3', imageUrl: require('../../assets/images/sponsorBanner-03.png'), linkUrl: 'https://maricafutebolclube.com' },
  { id: 'l4', imageUrl: require('../../assets/images/sponsorBanner-04.png'), linkUrl: 'https://maricafutebolclube.com' },
  { id: 'l5', imageUrl: require('../../assets/images/sponsorBanner-05.png'), linkUrl: 'https://maricafutebolclube.com' },
  { id: 'l6', imageUrl: require('../../assets/images/sponsorBanner-06.png'), linkUrl: 'https://maricafutebolclube.com' },
];

export default function AdBanner() {
  const [banners, setBanners] = useState(LOCAL_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // 1. Tentar carregar banners dinâmicos do Firebase
    const q = query(collection(db, "ads_banners"), where("active", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const cloudBanners = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Se vier do cloud, imageUrl será uma string URI
          isCloud: true
        }));
        setBanners(cloudBanners);
      } else {
        setBanners(LOCAL_BANNERS);
      }
    }, (error) => {
      console.log("Erro AdBanner Firebase:", error);
      setBanners(LOCAL_BANNERS);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      // Animação de Fade Out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
        // Animação de Fade In
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 8000); // 8 segundos

    return () => clearInterval(timer);
  }, [banners, fadeAnim]);

  const currentAd = banners[currentIndex];

  const handlePress = () => {
    if (currentAd?.linkUrl) {
      Linking.openURL(currentAd.linkUrl);
    }
  };

  if (!currentAd) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.adLabel}>PATROCÍNIO OFICIAL</Text>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handlePress}
        style={styles.adWrapper}
      >
        <Animated.View style={{ opacity: fadeAnim, width: '100%', height: '100%' }}>
          <Image 
            source={currentAd.isCloud ? { uri: currentAd.imageUrl } : currentAd.imageUrl} 
            style={styles.adImage}
            resizeMode="contain"
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 20, alignItems: 'center' },
  adLabel: { fontSize: 9, fontWeight: '900', color: '#BBB', letterSpacing: 3, marginBottom: 15 },
  adWrapper: { 
    width: width - 50, 
    height: 100, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  adImage: { width: '100%', height: '100%' }
});
