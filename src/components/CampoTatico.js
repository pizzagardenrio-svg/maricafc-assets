import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = { navy: '#002147', gold: '#D4AF37', white: '#FFFFFF' };

const POSICOES_433 = [
  { top: '82%', left: '40%' }, 
  { top: '57%', left: '4%' },  
  { top: '64%', left: '25%' }, 
  { top: '64%', left: '55%' }, 
  { top: '57%', left: '76%' }, 
  { top: '35%', left: '12%' }, 
  { top: '40%', left: '40%' }, 
  { top: '35%', left: '68%' }, 
  { top: '12%', left: '12%' }, 
  { top: '8%', left: '40%' }, 
  { top: '12%', left: '68%' }, 
];

export default function CampoTatico({ titulares, confronto, onPlayerPress }) {
    return (
      <View style={styles.container}>
        <ImageBackground 
          source={{ uri: 'https://raw.githubusercontent.com/pizzagardenrio-svg/maricafc-assets/refs/heads/main/soccer-field-01.png' }} 
          style={styles.field}
          imageStyle={{ 
            borderRadius: 10,
            opacity: 0.7 
          }}
        >
          {titulares && titulares.slice(0, 11).map((player, index) => {
            if (!player || !POSICOES_433[index]) return null; 
  
            return (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.playerNode, 
                  { 
                    top: POSICOES_433[index].top, 
                    left: POSICOES_433[index].left 
                  }
                ]}
                onPress={() => onPlayerPress && onPlayerPress(player)}
                activeOpacity={0.8}
              >
                <View style={styles.avatarWrapper}>
                  <Image 
                    source={{ uri: player.img || 'https://via.placeholder.com' }} 
                    style={styles.avatar} 
                    resizeMode="contain" 
                  />
                </View>
                <View style={styles.nameTag}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.name ? player.name.split(' ')[0].toUpperCase() : "---"} 
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ImageBackground> 

        <View style={styles.avaliacaoHeader}>
          <Text style={styles.avaliacaoTitle}>CRAQUE DA TORCIDA</Text>
          <Text style={styles.avaliacaoSubtitle}>AVALIAÇÃO DE PERFORMANCE</Text>
          <Text style={styles.regrasText}>
            Assista ao jogo, acerte o placar final e desbloqueie a avaliação. 
            Dê sua nota para os guerreiros em campo e defina o craque da partida!
          </Text>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, marginBottom: 40, paddingHorizontal: 5 },

  avaliacaoHeader: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  avaliacaoTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 2,
  },
  avaliacaoSubtitle: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  regrasText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
    paddingHorizontal: 10,
  },

  field: { 
    width: '100%', 
    height: 420, 
    backgroundColor: '#1a472a', 
    elevation: 8,
    overflow: 'hidden',
    borderRadius: 10
  },
  playerNode: { position: 'absolute', alignItems: 'center', width: 65 },
  avatarWrapper: { 
    width: 75, 
    height: 75, 
    overflow: 'hidden',
    elevation: 4
  },
  avatar: { width: '100%', height: '100%' },
  nameTag: { 
    backgroundColor: 'rgba(0,33,71,0.9)', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4, 
    marginTop: 1 
  },
  playerName: { color: COLORS.white, fontSize: 8, fontWeight: 'bold' },
});
