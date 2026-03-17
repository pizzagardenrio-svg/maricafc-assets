import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ImageBackground, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // Ícones nativos do Expo

const COLORS = { navy: '#002147', gold: '#D4AF37', white: '#FFFFFF' };

export default function CardClube() {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <ImageBackground 
        source={{ uri: image }} 
        style={styles.image} 
        imageStyle={{ borderRadius: 10 }} // Padronizado com o Gradient
      >
        {/* Etiqueta de Categoria (Opcional) */}
        {label && (
          <View style={styles.labelBadge}>
            <Text style={styles.labelText}>{label.toUpperCase()}</Text>
          </View>
        )}

        <LinearGradient 
          colors={['transparent', 'rgba(0,33,71,0.95)']} 
          style={styles.gradient}
        >
          <View style={styles.footerRow}>
            <View style={styles.textWrapper}>
              <Text style={styles.title}>{title?.toUpperCase()}</Text>
              <Text style={styles.subtitle}>{sub}</Text>
            </View>
            
            {/* Ícone que indica "Clique para entrar" */}
            <Ionicons name="chevron-forward-circle" size={24} color={COLORS.gold} />
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { 
    height: 160, 
    marginHorizontal: 20, 
    marginBottom: 20, 
    elevation: 6, // Sombra um pouco mais forte para destaque
    backgroundColor: COLORS.navy,
    borderRadius: 10 
  },
  image: { flex: 1, justifyContent: 'flex-end' },
  labelBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,33,71,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: COLORS.gold
  },
  labelText: { color: COLORS.gold, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  gradient: { 
    height: '70%', 
    padding: 15, 
    justifyContent: 'flex-end', 
    borderRadius: 10 
  },
  footerRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    justifyContent: 'space-between' 
  },
  textWrapper: { 
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.gold, 
    paddingLeft: 12,
    flex: 1 
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { color: COLORS.gold, fontSize: 11, fontWeight: '700', marginTop: 2 }
});
