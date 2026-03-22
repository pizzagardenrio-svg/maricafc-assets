import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { auth } from '../src/config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const COLORS = {
  navy:  '#002147',
  gold:  '#D4AF37',
  paper: '#F4F4F0',
  white: '#FFFFFF',
  muted: '#858580',
};

/**
 * Na Web, o autoplay de vídeo é bloqueado por padrão nos navegadores modernos,
 * então a intro é pulada e o formulário aparece diretamente.
 * No mobile (iOS / Android) o comportamento original com vídeo é mantido.
 */
const IS_WEB = Platform.OS === 'web';

export default function Index() {
  const router = useRouter();

  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [loading,        setLoading]        = useState(false);
  // Web: começa true (sem intro). Mobile: começa false (aguarda vídeo).
  const [videoFinished,  setVideoFinished]  = useState(IS_WEB);
  // Enquanto o Firebase verifica a sessão, não renderizamos nada para
  // evitar flash de tela branca / redirect incorreto.
  const [initializing,   setInitializing]   = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuário já logado → vai direto para a home, sem passar pelo formulário.
        router.replace('/hq');
      }
      // Só marca como "pronto" após a resposta do Firebase.
      setInitializing(false);
    });

    // Cancela o listener ao desmontar o componente.
    return unsubscribe;
  }, []);

  // ─── Loader de inicialização ─────────────────────────────────────────────
  // Exibido enquanto o Firebase ainda não respondeu se há sessão ativa.
  // Evita que o formulário pisce na tela por um frame antes do redirect.
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

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
    if (!email) {
      Alert.alert('Atenção', 'Digite seu e-mail primeiro.');
      return;
    }
    sendPasswordResetEmail(auth, email.trim())
      .then(() => Alert.alert('Sucesso', 'Link para redefinir senha enviado.'))
      .catch(() => Alert.alert('Erro', 'E-mail não encontrado.'));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.masterContainer}>

      {/* ── VÍDEO DE INTRO — somente mobile, somente antes de terminar ── */}
      {!IS_WEB && !videoFinished && (
        <View style={styles.videoOverlay}>
          <Video
            source={require('../assets/images/intro.mp4')}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              // Garante type-safety (AVPlaybackStatus pode ser erro ou sucesso)
              if (status.isLoaded && status.didJustFinish) {
                setVideoFinished(true);
              }
            }}
          />
        </View>
      )}

      {/* ── FORMULÁRIO — aparece após vídeo (mobile) ou imediatamente (web) ── */}
      {videoFinished && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.content}>

            {/* Cabeçalho / Logo */}
            <View style={styles.header}>
              <Image
                source={require('../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>MARICÁ FC</Text>
              <Text style={styles.subtitle}>PORTAL DO SÓCIO • TSUNAMI</Text>
            </View>

            {/* Campos de login */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gold} />
                <TextInput
                  placeholder="E-mail do Sócio"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gold} />
                <TextInput
                  placeholder="Sua senha"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={loading}
              >
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

            {/* Rodapé */}
            <View style={styles.footerActions}>
              <TouchableOpacity onPress={() => router.push('/cadastro')} style={styles.actionBtn}>
                <Text style={styles.actionTextNormal}>
                  Ainda não é sócio?{' '}
                  <Text style={styles.actionTextBold}>CADASTRE-SE</Text>
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 20 }}>
                <TouchableOpacity onPress={handleEsqueciSenha} style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>ESQUECI A SENHA</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/hq')} style={styles.forgotBtn}>
                  <Text style={[styles.forgotText, { color: COLORS.navy, opacity: 0.6 }]}>
                    SEM LOGIN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </KeyboardAvoidingView>
      )}

    </View>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Loader de inicialização (Firebase ainda não respondeu)
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },

  masterContainer: { flex: 1, backgroundColor: COLORS.paper },

  // Overlay do vídeo de intro (mobile)
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    backgroundColor: COLORS.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: { width, height },

  // Formulário
  container: { flex: 1 },
  content:   { flex: 1, justifyContent: 'center', paddingHorizontal: 35 },

  header:   { alignItems: 'center', marginBottom: 25 },
  logo:     { width: 75, height: 75, marginBottom: 15 },
  title:    { fontSize: 24, fontWeight: '900', color: COLORS.navy, letterSpacing: 1 },
  subtitle: { fontSize: 10, color: COLORS.muted, fontWeight: '700', letterSpacing: 2, marginTop: 4 },

  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12,
    marginBottom: 15, paddingHorizontal: 18, height: 60,
    borderWidth: 1, borderColor: '#EEE',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3,
  },
  input: { flex: 1, color: COLORS.navy, fontWeight: '600', fontSize: 15, marginLeft: 12 },

  loginBtn: {
    backgroundColor: COLORS.gold, height: 60, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    elevation: 4,
  },
  loginBtnText: { color: COLORS.navy, fontWeight: '900', fontSize: 15, letterSpacing: 1 },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EEE' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12, fontWeight: '700' },

  googleBtn: {
    flexDirection: 'row', backgroundColor: COLORS.white, height: 60,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EEE',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
