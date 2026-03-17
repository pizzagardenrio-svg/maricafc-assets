import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';

export default function IntroVideo() {
  const router = useRouter();
  
  useEffect(() => {
    // 🛡️ Blindagem 1: Timer de segurança (Fail-safe)
    // Se o vídeo de 3s travar por qualquer motivo, o app abre em 4.5s
    const backupTimer = setTimeout(() => {
      router.replace('/');
    }, 4500);

    return () => clearTimeout(backupTimer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden translucent backgroundColor="transparent" />
      
      <Video
        source={require('../assets/images/intro.mp4')} 
        style={styles.videoFull} 
        resizeMode={ResizeMode.CONTAIN} 
        shouldPlay
        isLooping={false}
        playsInSilentModeIOS={true} // 🛡️ Blindagem 2: Som sai mesmo no silencioso (iOS)
        
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            router.replace('/');
          }
        }}
        
        onError={(error) => {
          console.log("Erro no vídeo:", error);
          // 🛡️ Blindagem 3: Fallback imediato para não perder o torcedor
          router.replace('/'); 
        }}
      />
    </View> 
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F4F0', // Mesma cor do início do vídeo
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  videoFull: { 
    ...StyleSheet.absoluteFillObject 
  },
});
