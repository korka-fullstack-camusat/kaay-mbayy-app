import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Icon } from './Icon';

interface User {
  id: number;
  name: string;
  phone: string;
  dial_code: string;
  location?: string | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  diagnosisCount?: number;
  parcelCount?: number;
}

const MENU_ITEMS = [
  { icon: 'user', label: 'Modifier mon profil' },
  { icon: 'leaf', label: 'Mes parcelles' },
  { icon: 'bell', label: 'Notifications' },
  { icon: 'phone', label: 'Aide & support' },
];

export function ProfileModal({ visible, onClose, user, onLogout, diagnosisCount = 0, parcelCount = 0 }: Props) {
  if (!user) return null;
  const initials = user.name
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>Mon profil</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={18} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.locationText}>
              {user.location || 'Sénégal'}
            </Text>
            <Text style={styles.phone}>{user.dial_code} {user.phone.replace(user.dial_code, '')}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Stat label="Parcelles" value={parcelCount.toString()} tone="green" />
            <Stat label="Diagnostics" value={diagnosisCount.toString()} tone="gold" />
            <Stat label="Compte vérifié" value="✓" tone="dark" />
          </View>

          {/* Menu */}
          <View style={{ marginTop: 18, paddingHorizontal: 20 }}>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuBorder]}
              >
                <Icon name={item.icon} size={20} color={Colors.greenDeep} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Icon name="arrow" size={16} color={Colors.inkMute} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Icon name="logout" size={16} color={Colors.clay} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  const bg = tone === 'green' ? Colors.greenSoft : tone === 'gold' ? Colors.goldSoft : Colors.bgMuted;
  const fg = tone === 'green' ? Colors.greenDeep : tone === 'gold' ? Colors.gold : Colors.ink;
  return (
    <View style={[styles.statBox, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color: fg }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: fg, opacity: 0.7 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(20,32,26,0.45)' },
  sheet: {
    backgroundColor: Colors.bgCream,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '88%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.line,
    borderRadius: 2, alignSelf: 'center', marginTop: 14, marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 11, fontWeight: '700', color: Colors.inkMute,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgMuted, alignItems: 'center', justifyContent: 'center',
  },
  hero: { alignItems: 'center', paddingVertical: 20 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#F6E0B0', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.ink },
  locationText: { fontSize: 13, color: Colors.inkMute, marginTop: 4 },
  phone: { fontSize: 13, color: Colors.inkMute, marginTop: 4, fontVariant: ['tabular-nums'] },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  statBox: { flex: 1, borderRadius: 12, padding: 10 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.ink },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 20, height: 50,
    backgroundColor: Colors.claySoft, borderRadius: 50,
  },
  logoutText: { color: Colors.clay, fontWeight: '700', fontSize: 14 },
});
