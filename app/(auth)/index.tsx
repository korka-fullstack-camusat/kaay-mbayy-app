import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgCream} />

      {/* Decorative orbs */}
      <View style={styles.orbA} />
      <View style={styles.orbB} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>KM</Text>
        </View>
        <Text style={styles.headline}>
          L'agriculture{'\n'}
          <Text style={styles.headlineAccent}>plus intelligente.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Diagnostique tes plantes, vois la carte agricole, vends tes produits — en wolof et en français.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Créer un compte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.ghostBtnText}>J'ai déjà un compte</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          En continuant, tu acceptes les conditions d'utilisation.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCream },
  orbA: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: Colors.greenSoft, top: -80, right: -80, opacity: 0.6,
  },
  orbB: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.claySoft, bottom: 200, left: -60, opacity: 0.5,
  },
  hero: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingTop: 32,
  },
  logoCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.clay, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
    marginBottom: 28,
  },
  logoText: { color: '#F6E0B0', fontSize: 36, fontWeight: '900' },
  headline: {
    fontSize: 32, fontWeight: '900', color: Colors.ink,
    textAlign: 'center', lineHeight: 38,
  },
  headlineAccent: { color: Colors.clay, fontStyle: 'italic' },
  subtitle: {
    fontSize: 15, color: Colors.inkSoft, textAlign: 'center',
    lineHeight: 22, marginTop: 14, maxWidth: 280,
  },
  actions: {
    paddingHorizontal: 24, paddingBottom: 40, gap: 10,
  },
  primaryBtn: {
    height: 54, backgroundColor: Colors.clay,
    borderRadius: 50, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  ghostBtn: {
    height: 54, backgroundColor: 'transparent',
    borderRadius: 50, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.line,
  },
  ghostBtnText: { color: Colors.ink, fontSize: 15, fontWeight: '600' },
  legal: { textAlign: 'center', fontSize: 12, color: Colors.inkMute, marginTop: 6 },
});
