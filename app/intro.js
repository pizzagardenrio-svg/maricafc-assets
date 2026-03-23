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
      p.muted = true; // Crítico: Navegadores e Vercel barram autoplay COM SOM
      p.play();
    }
  );

  useEffect(() => {
    // 🛡️ Segurança: Navega automaticamente após 4.5s
    // Como está em Loop, o playToEnd não será disparado naturalmente, 
    // dependemos deste timer para ir à tela inicial.
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
      <StatusBar hidden translucent backgroundColor="transparent" />

      <VideoView
        player={player}
        style={styles.videoFull}
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
    backgroundColor: '#002147',
  },
  videoFull: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
