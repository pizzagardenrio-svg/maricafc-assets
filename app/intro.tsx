import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Carregamento condicional seguro para evitar erro de 'module not found' na Web
let useVideoPlayer = null;
let VideoView = null;

if (Platform.OS !== 'web') {
  try {
    const expoVideo = require('expo-video');
    useVideoPlayer = expoVideo.useVideoPlayer;
    VideoView = expoVideo.VideoView;
  } catch (e) {
    console.warn('Erro ao carregar expo-video no Native');
  }
}

const VIDEO_ASSET = require('../assets/images/intro.mp4');

// Resolve o caminho do vídeo removendo tipagens que quebram o JS puro
function resolveWebVideoSrc(asset) {
  if (typeof asset === 'string') return asset;
  if (asset && typeof asset === 'object') {
    if (asset.default) return asset.default;
    if (asset.uri) return asset.uri;
  }
  return String(asset);
}

const REDIRECT_DELAY_MS = 4500;

// ─── Componente Web (Safari/Vercel) ──────────────────────────────────────────
function IntroWeb({ onEnd }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(onEnd, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onEnd]);

  const src = resolveWebVideoSrc(VIDEO_ASSET);

  return (
    <View style={styles.container}>
      <video 
        src={require('../assets/images/intro.mp4')} 
        autoPlay 
        muted 
        loop 
        playsInline 
        style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} 
      />
    </View>
  );
}

// ─── Componente Native (iPhone/Android Expo Go) ──────────────────────────────
function IntroNative({ onEnd }) {
  const player = useVideoPlayer(VIDEO_ASSET, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const timer = setTimeout(onEnd, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <View style={styles.container}>
      {VideoView && (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          playsInLine={true}
        />
      )}
    </View>
  );
}

// ─── Tela Principal ───────────────────────────────────────────────────────────
export default function IntroVideo() {
  const router = useRouter();

  const handleEnd = useCallback(() => {
    router.replace('/');
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden translucent backgroundColor="transparent" />
      {Platform.OS === 'web' ? (
        <IntroWeb onEnd={handleEnd} />
      ) : (
        <IntroNative onEnd={handleEnd} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
