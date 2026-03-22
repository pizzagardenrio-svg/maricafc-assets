import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Animated, Dimensions
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { auth } from '../src/config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const COLORS = { navy: '#002147', gold: '#D4AF37', paper: '#F4F4F0', white: '#FFFFFF', intro: '#F4F4F0', muted: '#858580' };

export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoFinished, setVideoFinished] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const checkUserAndNavigate = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/hq');
      } else {
        setVideoFinished(true);
      }
    });
    return unsubscribe;
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(() => router.replace('/hq'))
      .catch(() => Alert.alert("Erro", "E-mail ou senha incorretos."))
      .finally(() => setLoading(false));
  };

  const handleEsqueciSenha = () => {
    if (!email) {
      Alert.alert("Atenção", "Digite seu e-mail.");
      return;
    }
    sendPasswordResetEmail(auth, email.trim())
      .then(() => Alert.alert("Sucesso", "Link enviado."))
      .catch(() => Alert.alert("Erro", "E-mail não encontrado."));
  };

  return (
    <View style={styles.masterContainer}>

      {/* 1. VÍDEO DE INTRO */}
      {!videoFinished && (
        <View style={styles.videoOverlay}>
          <Video
            source={require('../assets/images/intro.mp4')}
            style={[styles.video, { backgroundColor: COLORS.paper }]}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                checkUserAndNavigate();
              }
            }}
          />
        </View>
      )}
      {/* 2. FORMULÁRIO */}
      <View style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
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
              {loading ? <ActivityIndicator color={COLORS.navy} /> : <Text style={styles.loginBtnText}>ENTRAR AGORA</Text>}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={() => Alert.alert("Integração em Breve", "O Login do Google exige a configuração prévia das chaves da Google Cloud (Client ID) no painel do Firebase Developer. Esta opção será ativada no Build oficial.")}>
              <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Entrar com Google</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.footerActions}>
            <TouchableOpacity onPress={() => router.push('/cadastro')} style={styles.actionBtn}>
              <Text style={styles.actionTextNormal}>Ainda não é sócio? <Text style={styles.actionTextBold}>CADASTRE-SE</Text></Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity onPress={handleEsqueciSenha} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>ESQUECi A SENHA</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace('/hq')} style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: COLORS.navy, opacity: 0.6 }]}>ACESSAR SEM LOGIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: 'transparent' },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    backgroundColor: COLORS.paper,
    justifyContent: 'center',
    alignItems: 'center'
  },
  video: { width: width, height: height },

  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 35 },
  header: { alignItems: 'center', marginBottom: 25 },
  logo: { width: 75, height: 75, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.navy, letterSpacing: 1 },
  subtitle: { fontSize: 10, color: COLORS.muted, fontWeight: '700', letterSpacing: 2, marginTop: 4 },

  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 12, marginBottom: 15, paddingHorizontal: 18, height: 60,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  input: { flex: 1, color: COLORS.navy, fontWeight: '600', fontSize: 15, marginLeft: 12 },
  loginBtn: { backgroundColor: COLORS.gold, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 5 },
  loginBtnText: { color: COLORS.navy, fontWeight: '900', fontSize: 15, letterSpacing: 1 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EEE' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12, fontWeight: '700' },

  googleBtn: {
    flexDirection: 'row', backgroundColor: COLORS.white, height: 60, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    borderWidth: 1, borderColor: '#EEE'
  },
  googleBtnText: { color: '#444', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },

  footerActions: { marginTop: 20, alignItems: 'center' },
  actionBtn: { padding: 10 },
  actionTextNormal: { color: COLORS.navy, fontSize: 13, opacity: 0.7 },
  actionTextBold: { fontWeight: '900', textDecorationLine: 'underline' },
  forgotBtn: { marginTop: 15 },
  forgotText: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 }
});
