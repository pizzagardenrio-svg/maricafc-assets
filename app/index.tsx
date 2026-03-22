import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { auth } from '../src/config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const COLORS = {
  navy:  '#002147',
  gold:  '#D4AF37',
  paper: '#F4F4F0',
  white: '#FFFFFF',
  muted: '#858580',
};

export default function Index() {
  const router = useRouter();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [bootError,    setBootError]    = useState<string | null>(null);

  // ─── expo-video: player mudo em loop ────────────────────────────────────
  // useVideoPlayer substitui o <Video> do expo-av depreciado no SDK 54.
  // loop + muted garante autoplay sem bloqueio em qualquer navegador.
  const player = useVideoPlayer(
    require('../assets/images/intro.mp4'),
    (p) => {
      p.loop   = true;
      p.muted  = true;
      p.play();
    }
  );

  // ─── Listener de sessão ──────────────────────────────────────────────────
  useEffect(() => {
    let unsubscribe: () => void;
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) router.replace('/hq');
          setInitializing(false);
        },
        (error) => {
          console.error('[Index] onAuthStateChanged error:', error);
          setBootError(error.message);
          setInitializing(false);
        }
      );
    } catch (e: any) {
      console.error('[Index] Firebase listener falhou:', e);
      setBootError(e?.message ?? String(e));
      setInitializing(false);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(() => router.replace('/hq'))
      .catch((err) => {
        console.error('[Login]', err.code);
        Alert.alert('Erro', 'E-mail ou senha incorretos.');
      })
      .finally(() => setLoading(false));
  };

  const handleEsqueciSenha = () => {
    if (!email) { Alert.alert('Atenção', 'Digite seu e-mail primeiro.'); return; }
    sendPasswordResetEmail(auth, email.trim())
      .then(() => Alert.alert('Sucesso', 'Link para redefinir senha enviado.'))
      .catch(() => Alert.alert('Erro', 'E-mail não encontrado.'));
  };

  // ─── Loader de boot ──────────────────────────────────────────────────────
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  // ─── Tela de erro de boot ────────────────────────────────────────────────
  if (bootError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Erro de Configuração</Text>
        <Text style={styles.errorMsg}>{bootError}</Text>
        <Text style={styles.errorHint}>Verifique as variáveis EXPO_PUBLIC_FIREBASE_* na Vercel.</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => setBootError(null)}>
          <Text style={styles.errorBtnText}>Continuar mesmo assim</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Render principal ────────────────────────────────────────────────────
  return (
    /*
      GestureHandlerRootView envolve toda a tela para resolver o aviso
      "Cannot record touch end without a touch start" que ocorre na web
      quando o react-native-gesture-handler não tem um root registrado.
    */
    <GestureHandlerRootView style={styles.masterContainer}>

      {/*
        ── VÍDEO DE BACKGROUND ──────────────────────────────────────────────
        VideoView (expo-video) substitui <Video> do expo-av.
        • nativeControls={false} → sem barra de controles visível
        • contentFit="cover"     → equivalente ao ResizeMode.COVER
        • style absoluteFillObject + zIndex 0 → fica atrás do formulário
        • player configurado com loop + muted + play() no useVideoPlayer
      */}
      <VideoView
        player={player}
        style={styles.videoBg}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      {/* ── FORMULÁRIO — sempre visível, zIndex 1 acima do vídeo ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.content}>

          <View style={styles.header}>
            <Image source={require('../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>MARICÁ FC</Text>
            <Text style={styles.subtitle}>PORTAL DO SÓCIO • TSUNAMI</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gold} />
              <TextInput
                placeholder="E-mail do Sócio" style={styles.input} value={email}
                onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gold} />
              <TextInput
                placeholder="Sua senha" style={styles.input} value={password}
                onChangeText={setPassword} secureTextEntry placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading
                ? <ActivityIndicator color={COLORS.navy} />
                : <Text style={styles.loginBtnText}>ENTRAR AGORA</Text>
              }
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => Alert.alert('Em breve', 'Login com Google disponível na versão final.')}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Entrar com Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerActions}>
            <TouchableOpacity onPress={() => router.push('/cadastro')} style={styles.actionBtn}>
              <Text style={styles.actionTextNormal}>
                Ainda não é sócio?{' '}<Text style={styles.actionTextBold}>CADASTRE-SE</Text>
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity onPress={handleEsqueciSenha} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>ESQUECI A SENHA</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.replace('/hq')} style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: COLORS.navy, opacity: 0.6 }]}>SEM LOGIN</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, backgroundColor: COLORS.paper,
    justifyContent: 'center', alignItems: 'center',
  },
  errorContainer: {
    flex: 1, backgroundColor: '#FFF3F3',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  errorTitle:   { fontSize: 18, fontWeight: '900', color: '#880000', marginBottom: 12 },
  errorMsg:     { fontSize: 12, color: '#550000', textAlign: 'center', marginBottom: 16 },
  errorHint:    { fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 24 },
  errorBtn:     { backgroundColor: '#002147', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  errorBtnText: { color: '#FFF', fontWeight: '700' },

  masterContainer: { flex: 1, backgroundColor: COLORS.paper },

  // Vídeo — camada de fundo (zIndex implicitamente 0)
  videoBg: { ...StyleSheet.absoluteFillObject, width, height },

  // Formulário — camada de frente
  overlay: { flex: 1, zIndex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 35 },

  header:   { alignItems: 'center', marginBottom: 25 },
  logo:     { width: 75, height: 75, marginBottom: 15 },
  title:    { fontSize: 24, fontWeight: '900', color: COLORS.navy, letterSpacing: 1 },
  subtitle: { fontSize: 10, color: COLORS.muted, fontWeight: '700', letterSpacing: 2, marginTop: 4 },

  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 12, marginBottom: 15, paddingHorizontal: 18, height: 60,
    borderWidth: 1, borderColor: '#EEE',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3,
  },
  input: { flex: 1, color: COLORS.navy, fontWeight: '600', fontSize: 15, marginLeft: 12 },

  loginBtn: {
    backgroundColor: COLORS.gold, height: 60, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4,
  },
  loginBtnText: { color: COLORS.navy, fontWeight: '900', fontSize: 15, letterSpacing: 1 },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EEE' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12, fontWeight: '700' },

  googleBtn: {
    flexDirection: 'row', backgroundColor: COLORS.white, height: 60,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EEE',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2,
  },
  googleBtnText: { color: '#444', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },

  footerActions:    { marginTop: 20, alignItems: 'center' },
  actionBtn:        { padding: 10 },
  actionTextNormal: { color: COLORS.navy, fontSize: 13, opacity: 0.7 },
  actionTextBold:   { fontWeight: '900', textDecorationLine: 'underline' },
  forgotBtn:        { marginTop: 15 },
  forgotText:       { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
});