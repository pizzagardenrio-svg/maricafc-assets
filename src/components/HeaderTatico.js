import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = { 
  navy: '#002147', 
  gold: '#D4AF37', 
  goldChampagne: '#E8D4A2', 
  white: '#FFFFFF', 
  darkRed: '#880000',
  deepDarkRed: '#550000'
};

export default function HeaderTatico() {
  return (
    <LinearGradient
      colors={[COLORS.deepDarkRed, COLORS.darkRed]} 
      start={{ x: 0, y: 0 }} 
      end={{ x: 0, y: 1 }}   
      style={styles.headerContainer}
    >
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Image 
            source={require('../../assets/images/escudo-redondo-02.png')} 
            style={styles.mainLogo} 
            resizeMode="contain"
          />
          
          <View style={styles.textStack}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>MARICÁ FC</Text>
              <Image 
                source={require('../../assets/images/logo-star.png')} 
                style={styles.starLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.subtitle}>TSUNAMI DA BAIXADA • APP OFICIAL</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: { 
    paddingTop: 55, 
    paddingBottom: 14, 
    borderBottomWidth: 0.8, 
    borderBottomColor: COLORS.deepDarkRed, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    zIndex: 100, 
  },
  content: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  brandRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  mainLogo: { 
    width: 46, 
    height: 46, 
    marginRight: 12 
  },
  textStack: { 
    justifyContent: 'center' 
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: COLORS.white, 
    letterSpacing: 0.8 
  },
  starLogo: {
    width: 26, 
    height: 26,
    marginLeft: 6,
  },
  subtitle: { 
    fontSize: 8.5, 
    color: COLORS.goldChampagne, 
    fontWeight: '700', 
    letterSpacing: 1.2, 
    marginTop: -1 
  },
});
