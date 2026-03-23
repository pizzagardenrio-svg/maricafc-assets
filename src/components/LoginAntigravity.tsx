import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

/**
 * Componente Antigravity Login Example
 * Demonstra as fisicas "weightless" (sem peso), botões em Glassmorphism
 * e total fluidez de animação para SDK 54.
 */
export default function LoginAntigravity() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  // Fisicas Antigravity
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      // O AppShell _layout cuidará do redirecionamento ao detectar auth state.
    } catch (error: any) {
      alert("Erro de Firebase Auth: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "ENTRAR NO CLUBE" : "CRIAR CONTA"}</Text>
      
      <View style={styles.glassCard}>
        <TextInput 
          style={styles.input}
          placeholder="E-mail principal"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput 
          style={styles.input}
          placeholder="Senha super secreta"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', marginTop: 20 }}>
          <TouchableOpacity 
            activeOpacity={1}
            onPressIn={animatePressIn}
            onPressOut={animatePressOut}
            onPress={handleAuth}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnText}>{isLogin ? "ACESSAR CONTA" : "FORJAR ACESSO"}</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {isLogin ? "Ainda não tem conta? Criar agora" : "Já na elite? Faça login"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#002147',
    marginBottom: 30,
    letterSpacing: 1.5,
  },
  glassCard: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(10px)',
      } as any
    }),
  },
  input: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontWeight: '600',
    color: '#002147',
  },
  btnPrimary: {
    height: 60,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnText: {
    color: '#002147',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  toggleBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#550000',
    fontWeight: 'bold',
    fontSize: 12,
  }
});
