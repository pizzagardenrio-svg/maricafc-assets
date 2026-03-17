import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { auth, db } from '../src/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

const COLORS = { navy: '#002147', gold: '#D4AF37', paper: '#F4F4F0', white: '#FFFFFF' };

export default function cadastro() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !password || !cpf || !nascimento || !whatsapp) {
      Alert.alert("Campos Incompletos", "Por favor, preencha todas as informações essenciais para abrir sua conta de Sócio Torcedor.");
      return;
    }

    setLoading(true);
    try {
      // 1. Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Cria o documento do usuário no Firestore (Coleção socio_torcedor)
      await setDoc(doc(db, "socio_torcedor", user.uid), {
        nomeCompleto: nome.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpf.trim(),
        dataNascimento: nascimento.trim(),
        whatsapp: whatsapp.trim(),
        planoAtual: "Free", 
        statusPagamento: "ativo",
        createdAt: new Date().toISOString(),
        totalVotos: 0,
        // Optional tracking fields
        cep: "",
        cidade: "",
        bairro: "",
        genero: ""
      });

      Alert.alert("Bem-vindo!", "Conta criada com sucesso no Tsunami!",);
    } catch (error) {
      Alert.alert("Erro ao cadastrar", "Verifique os dados ou se o e-mail já está em uso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
            <Text style={styles.backText}>VOLTAR</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>NOVA CONTA</Text>
            <Text style={styles.subtitle}>FAÇA PARTE DA ELITE DO MARICÁ FC</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.gold} style={styles.icon} />
              <TextInput placeholder="Nome Completo" placeholderTextColor="#888" style={styles.input} value={nome} onChangeText={setNome} />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gold} style={styles.icon} />
              <TextInput placeholder="E-mail principal" placeholderTextColor="#888" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color={COLORS.gold} style={styles.icon} />
              <TextInput placeholder="CPF (Apenas números)" placeholderTextColor="#888" style={styles.input} value={cpf} onChangeText={setCpf} keyboardType="numeric" maxLength={11} />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.gold} style={styles.icon} />
              <TextInput placeholder="Nascimento (DD/MM/AAAA)" placeholderTextColor="#888" style={styles.input} value={nascimento} onChangeText={setNascimento} />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.gold} style={styles.icon} />
              <TextInput placeholder="WhatsApp (DDD + Número)" placeholderTextColor="#888" style={styles.input} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gold} style={styles.icon} />
              <TextInput placeholder="Senha (mín. 6 caracteres)" placeholderTextColor="#888" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleCadastro} activeOpacity={0.8} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.navy} /> : <Text style={styles.btnText}>CRIAR CONTA SECRETA</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 25 },
  backText: { color: COLORS.navy, fontWeight: '900', fontSize: 13, marginLeft: 8 },
  header: { marginBottom: 35, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.navy, letterSpacing: 1 },
  subtitle: { fontSize: 9, color: COLORS.gold, fontWeight: '900', marginTop: 5, letterSpacing: 2 },
  form: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 60, elevation: 3 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontWeight: '600', color: COLORS.navy },
  btn: { backgroundColor: COLORS.gold, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 15, elevation: 4 },
  btnText: { color: COLORS.navy, fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});
