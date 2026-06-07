import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/Icon';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const DIAL_CODES = [
  { code: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+220', flag: '🇬🇲', name: 'Gambie' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+224', flag: '🇬🇳', name: 'Guinée' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
];

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [dialCode, setDialCode] = useState('+221');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '').length;
  const valid = phoneDigits >= 8 && password.length >= 4;

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    try {
      const res = await authApi.login({ phone, dial_code: dialCode, password });
      await setAuth(res.data.access_token, res.data.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur de connexion', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={20} color={Colors.ink} />
          </TouchableOpacity>

          <View style={styles.logoBox}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>KM</Text>
            </View>
          </View>

          <Text style={styles.title}>Re-bonjour</Text>
          <Text style={styles.subtitle}>Connecte-toi pour retrouver tes parcelles.</Text>

          <View style={styles.form}>
            {/* Phone */}
            <View>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <View style={styles.phoneRow}>
                <View style={styles.dialBox}>
                  <Text style={styles.dialText}>{DIAL_CODES.find((d) => d.code === dialCode)?.flag} {dialCode}</Text>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0 }]}
                  placeholder="77 123 45 67"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.inkMute}
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.pwdRow}>
                <Icon name="lock" size={18} color={Colors.inkMute} />
                <TextInput
                  style={styles.pwdInput}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  placeholderTextColor={Colors.inkMute}
                />
                <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
                  <Icon name={showPwd ? 'eye-off' : 'eye'} size={18} color={Colors.inkMute} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!valid || loading) && styles.submitDisabled]}
              onPress={submit}
              disabled={!valid || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footer}>
              Pas encore de compte ?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => router.replace('/(auth)/signup')}
              >
                Créer un compte
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCream },
  scroll: { padding: 24, paddingTop: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgMuted, alignItems: 'center', justifyContent: 'center',
  },
  logoBox: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  logoCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#F6E0B0', fontSize: 26, fontWeight: '900' },
  title: { fontSize: 28, fontWeight: '900', color: Colors.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.inkSoft, textAlign: 'center', marginTop: 6, marginBottom: 28 },
  form: { gap: 16 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.inkSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  phoneRow: { flexDirection: 'row' },
  dialBox: {
    height: 52, paddingHorizontal: 12,
    backgroundColor: Colors.bgMuted, borderWidth: 1, borderColor: Colors.line,
    borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  dialText: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  input: {
    height: 52, paddingHorizontal: 14,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 14, fontSize: 15, color: Colors.ink,
  },
  pwdRow: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, gap: 8,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.line, borderRadius: 14,
  },
  pwdInput: { flex: 1, height: '100%', fontSize: 15, color: Colors.ink },
  submitBtn: {
    height: 54, backgroundColor: Colors.clay,
    borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 14, color: Colors.inkSoft, marginTop: 14 },
  footerLink: { color: Colors.clay, fontWeight: '700' },
});
