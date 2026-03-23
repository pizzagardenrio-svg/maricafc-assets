import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';

const VIDEO_SOURCE = require('../assets/images/intro.mp4');

export default function IntroVideo() {
  const router = useRouter();

  const player = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop  = true;
    p.muted = true; 
    p.play();
  });

  useEffect(() => {
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

      {Platform.OS === 'web' ? (
        <video 
          src={VIDEO_SOURCE}
          autoPlay 
          loop 
          muted 
          playsInline 
          controls={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }}
        />
      ) : (
        <VideoView
          player={player}
          style={{ flex: 1, backgroundColor: '#000' }}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          playsInLine={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
    paddingTop: 0,
    paddingBottom: 0,
  },
});
