import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// expo-video só é importado no Native (evita crash no build Vercel/Metro web)
let useVideoPlayer: any = null;
let VideoView: any = null;
if (Platform.OS !== 'web') {
  // Dynamic require garante que o bundler Metro não inclua o módulo nativo no bundle web
  const expoVideo = require('expo-video');
  useVideoPlayer = expoVideo.useVideoPlayer;
  VideoView      = expoVideo.VideoView;
}

// ─── Asset ───────────────────────────────────────────────────────────────────
// No Expo Web (Metro bundler), `require` de .mp4 retorna a URL do asset servido.
// No Native, retorna o número do asset resolvido pelo bundler.
// Ambos os casos são tratados corretamente abaixo.
const VIDEO_ASSET = require('../assets/images/intro.mp4');

// Resolve a URL correta para o elemento <video> HTML5 na Web.
// Metro devolve: number (native) | string | { uri: string } | { default: string }
function resolveWebVideoSrc(asset: unknown): string {
  if (typeof asset === 'string') return asset;
  if (asset && typeof asset === 'object') {
    // Metro web às vezes embala em { default: '...' }
    if ('default' in (asset as any)) return (asset as any).default as string;
    if ('uri'     in (asset as any)) return (asset as any).uri     as string;
  }
  // Fallback: converte para string (pode ser a URL direta em alguns bundlers)
  return String(asset);
}

const REDIRECT_DELAY_MS = 4500;

// ─── Componente Web ───────────────────────────────────────────────────────────
function IntroWeb({ onEnd }: { onEnd: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(onEnd, REDIRECT_DELAY_MS);

    const el = videoRef.current;
    if (el) {
      el.onerror = () => {
        clearTimeout(timer);
        onEnd();
      };
    }

    return () => clearTimeout(timer);
  }, [onEnd]);

  const src = resolveWebVideoSrc(VIDEO_ASSET);

  return (
    <View style={styles.container}>
      {/* @ts-ignore — elemento nativo Web dentro de RN Web */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#000',
          // Remove controles nativos no iOS Safari PWA
          WebkitAppearance: 'none',
        } as React.CSSProperties}
      />
    </View>
  );
}

// ─── Componente Native ────────────────────────────────────────────────────────
function IntroNative({ onEnd }: { onEnd: () => void }) {
  const player = useVideoPlayer(VIDEO_ASSET, (p: any) => {
    p.loop  = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const timer = setTimeout(onEnd, REDIRECT_DELAY_MS);

    const sub = player.addListener('statusChange', (status: any) => {
      if (status.error) {
        console.warn('[IntroVideo] Erro no player nativo:', status.error);
        clearTimeout(timer);
        onEnd();
      }
    });

    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        playsInLine={true}
      />
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function IntroVideo() {
  const router = useRouter();

  const handleEnd = React.useCallback(() => {
    // replace evita que o usuário volte para a intro com o botão back
    router.replace('/');
  }, [router]);

  return (
    <>
      <StatusBar hidden translucent backgroundColor="transparent" />
      {Platform.OS === 'web'
        ? <IntroWeb    onEnd={handleEnd} />
        : <IntroNative onEnd={handleEnd} />
      }
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
