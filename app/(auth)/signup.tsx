import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/Icon';
import { authApi, parcelsApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const ZONES_SN = [
  'Bakel', 'Bambey', 'Bignona', 'Dakar', 'Dahra', 'Dagana',
  'Diourbel', 'Fatick', 'Foundiougne', 'Gossas', 'Goudiry',
  'Guinguinéo', 'Joal', 'Kaffrine', 'Kaolack', 'Kébémer',
  'Kédougou', 'Kolda', 'Koungheul', 'Linguère', 'Louga',
  'Matam', 'Mbacké', 'Mbour', 'Mékhé', 'Nioro du Rip',
  'Oussouye', 'Podor', 'Ranérou', 'Richard Toll', 'Rufisque',
  'Saint-Louis', 'Sédhiou', 'Sokone', 'Tambacounda', 'Thiès',
  'Tivaouane', 'Touba', 'Vélingara', 'Ziguinchor',
];

export default function SignupScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [zone, setZone] = useState('');
  const [parcelCount, setParcelCount] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zoneActive, setZoneActive] = useState(false);

  // Suggestions filtrées en temps réel
  const suggestions = zoneActive && zone.trim().length > 0
    ? ZONES_SN.filter((z) => z.toLowerCase().startsWith(zone.trim().toLowerCase())).slice(0, 5)
    : [];

  const valid =
    name.trim().length >= 3 &&
    phone.replace(/\D/g, '').length >= 8 &&
    password.length >= 4 &&
    ZONES_SN.includes(zone);

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    try {
      const res = await authApi.signup({
        name: name.trim(),
        phone,
        dial_code: '+221',
        password,
        location: zone,
      });
      await setAuth(res.data.access_token, res.data.user);

      // Créer les parcelles automatiquement
      const n = parseInt(parcelCount, 10);
      if (n > 0 && n <= 50) {
        for (let i = 1; i <= n; i++) {
          try {
            await parcelsApi.create({ name: `Parcelle ${i}`, location: zone, status: 'bon' });
          } catch (_) {}
        }
      }

      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={20} color={Colors.ink} />
          </TouchableOpacity>

          <View style={styles.logoBox}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>KM</Text>
            </View>
          </View>

          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Quelques infos pour commencer.</Text>

          <View style={styles.form}>

            {/* Nom */}
            <View style={styles.field}>
              <Text style={styles.label}>Nom complet</Text>
              <View style={styles.inputRow}>
                <Icon name="user" size={18} color={Colors.inkMute} />
                <TextInput
                  style={styles.input}
                  placeholder="Votre nom complet"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.inkMute}
                />
              </View>
            </View>

            {/* Téléphone */}
            <View style={styles.field}>
              <Text style={styles.label}>Téléphone</Text>
              <View style={styles.phoneRow}>
                <View style={styles.dialBox}>
                  <Text style={styles.dialText}>🇸🇳 +221</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="77 123 45 67"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.inkMute}
                />
              </View>
            </View>

            {/* Zone agricole — autocomplete inline */}
            <View style={styles.field}>
              <Text style={styles.label}>Zone agricole</Text>
              <View style={styles.inputRow}>
                <Icon name="pin" size={18} color={ZONES_SN.includes(zone) ? Colors.green : Colors.inkMute} />
                <TextInput
                  style={styles.input}
                  placeholder="Tapez votre zone (ex: Kaolack)"
                  value={zone}
                  onChangeText={(t) => { setZone(t); setZoneActive(true); }}
                  onFocus={() => setZoneActive(true)}
                  onBlur={() => setTimeout(() => setZoneActive(false), 150)}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.inkMute}
                />
                {ZONES_SN.includes(zone) && (
                  <Icon name="check" size={16} color={Colors.ok} strokeWidth={2.5} />
                )}
              </View>
              {suggestions.length > 0 && (
                <View style={styles.dropdown}>
                  {suggestions.map((s, i) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.dropItem, i < suggestions.length - 1 && styles.dropDivider]}
                      onPress={() => { setZone(s); setZoneActive(false); }}
                    >
                      <Icon name="pin" size={13} color={Colors.inkMute} />
                      <Text style={styles.dropText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Nombre de parcelles */}
            <View style={styles.field}>
              <Text style={styles.label}>Nombre de parcelles</Text>
              <View style={styles.inputRow}>
                <Icon name="leaf" size={18} color={Colors.inkMute} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 3"
                  value={parcelCount}
                  onChangeText={(t) => setParcelCount(t.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor={Colors.inkMute}
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputRow}>
                <Icon name="lock" size={18} color={Colors.inkMute} />
                <TextInput
                  style={styles.input}
                  placeholder="Votre mot de passe"
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
              {loading
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.submitText}>Créer mon compte</Text>
              }
            </TouchableOpacity>

            <Text style={styles.footer}>
              Déjà un compte ?{' '}
              <Text style={styles.footerLink} onPress={() => router.replace('/(auth)/login')}>
                Se connecter
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
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#F6E0B0', fontSize: 22, fontWeight: '900' },
  title: { fontSize: 26, fontWeight: '900', color: Colors.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.inkSoft, textAlign: 'center', marginTop: 6, marginBottom: 28 },

  form: { gap: 16 },
  field: { gap: 6 },
  label: {
    fontSize: 12, fontWeight: '700', color: Colors.inkSoft,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputRow: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, gap: 10,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.line, borderRadius: 14,
  },
  input: { flex: 1, fontSize: 15, color: Colors.ink },
  phoneRow: { flexDirection: 'row' },
  dialBox: {
    height: 52, paddingHorizontal: 12,
    backgroundColor: Colors.bgMuted, borderWidth: 1, borderColor: Colors.line,
    borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  dialText: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  phoneInput: {
    flex: 1, height: 52, paddingHorizontal: 14,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.line,
    borderTopRightRadius: 14, borderBottomRightRadius: 14,
    fontSize: 15, color: Colors.ink,
  },

  // Autocomplete zone
  dropdown: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 12, marginTop: 4, overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  dropDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  dropText: { fontSize: 15, color: Colors.ink },

  submitBtn: {
    height: 54, backgroundColor: Colors.clay,
    borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 14, color: Colors.inkSoft, marginTop: 14, marginBottom: 8 },
  footerLink: { color: Colors.clay, fontWeight: '700' },
});
