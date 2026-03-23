import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function IntroVideo() {
  const router = useRouter();

  // ─── Player configurado para auto-play garantido via Muted ──────────────
  const player = useVideoPlayer(
    require('../assets/images/intro.mp4'),
    (p) => {
      p.loop  = true;
      p.muted = true; // Crítico: Navegadores barram autoplay COM SOM
      p.play();
    }
  );

  useEffect(() => {
    // 🛡️ Segurança: Navega automaticamente após 4.5s
    const backupTimer = setTimeout(() => {
      router.replace('/');
    }, 4500);

    const errorSub = player.addListener('statusChange', (status) => {
      if (status.error) {
        console.log('Erro no vídeo:', status.error);
        clearTimeout(backupTimer);
        router.replace('/');
      }
    });

    return () => {
      clearTimeout(backupTimer);
      errorSub.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Esconde a status bar durante a intro para imersão real */}
      <StatusBar hidden translucent backgroundColor="transparent" />

      <VideoView
        player={player}
        style={{ flex: 1, backgroundColor: '#000' }}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
