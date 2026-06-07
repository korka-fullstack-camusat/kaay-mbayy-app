import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Icon } from './Icon';

interface Props {
  user: { name: string; location?: string | null } | null;
  onBellPress: () => void;
  onAvatarPress: () => void;
  alertCount?: number;
}

export function AppHeader({ user, onBellPress, onAvatarPress, alertCount = 0 }: Props) {
  const firstName = user?.name?.split(' ')[0] || 'Utilisateur';
  const initials = (user?.name || '')
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'NF';

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onAvatarPress} style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </TouchableOpacity>

      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Bonjour {firstName} 👋</Text>
      </View>

      <TouchableOpacity onPress={onBellPress} style={styles.bellBtn}>
        <Icon name="bell" size={22} color={Colors.ink} />
        {alertCount > 0 && <View style={styles.badge} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 28 : 14,
    paddingBottom: 12,
    backgroundColor: Colors.bgCream,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#F6E0B0',
    fontWeight: '700',
    fontSize: 15,
  },
  greeting: {
    flex: 1,
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ink,
  },
  location: {
    fontSize: 12,
    color: Colors.inkMute,
    marginTop: 1,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.clay,
    borderWidth: 1.5,
    borderColor: Colors.bgCream,
  },
});
