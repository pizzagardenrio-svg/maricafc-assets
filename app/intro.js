import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function IntroVideo() {
  const router = useRouter();

  // ─── Player configurado para tocar uma vez, sem som ──────────────────────
  const player = useVideoPlayer(
    require('../assets/images/intro.mp4'),
    (p) => {
      p.loop  = true;
      p.muted = true; 
      p.play();
    }
  );

  useEffect(() => {
    // 🛡️ Blindagem 1: Timer de segurança — se o vídeo travar, abre em 4.5s
    const backupTimer = setTimeout(() => {
      router.replace('/');
    }, 4500);

    // Listener de fim de vídeo
    const subscription = player.addListener('playToEnd', () => {
      clearTimeout(backupTimer);
      router.replace('/');
    });

    // 🛡️ Blindagem 3: Listener de erro — fallback imediato
    const errorSub = player.addListener('statusChange', (status) => {
      if (status.error) {
        console.log('Erro no vídeo:', status.error);
        clearTimeout(backupTimer);
        router.replace('/');
      }
    });

    return () => {
      clearTimeout(backupTimer);
      subscription.remove();
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
    backgroundColor: '#F4F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoFull: {
    ...StyleSheet.absoluteFillObject,
  },
});
