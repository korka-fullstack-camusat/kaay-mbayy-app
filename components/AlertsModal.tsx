import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '@/services/api';
import { Colors } from '@/constants/Colors';
import { Icon } from './Icon';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ALERT_META = {
  maladie: { icon: 'flame', color: Colors.warn, bg: '#FDECEA', label: 'Maladie' },
  meteo:   { icon: 'cloud', color: '#3B6E8C', bg: '#D9E7EF', label: 'Météo' },
  event:   { icon: 'star',  color: Colors.gold, bg: Colors.goldSoft, label: 'Événement' },
  market:  { icon: 'arrow', color: Colors.green, bg: Colors.greenSoft, label: 'Marché' },
} as Record<string, { icon: string; color: string; bg: string; label: string }>;

export function AlertsModal({ visible, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.list().then((r) => r.data),
    enabled: visible,
  });

  const alerts: any[] = data || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Géolocalisées</Text>
            <Text style={styles.title}>Alertes</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={18} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.green} style={{ marginTop: 24 }} />
        ) : alerts.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" size={32} color={Colors.inkMute} />
            <Text style={styles.emptyText}>Aucune alerte pour le moment</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
            {alerts.map((a) => {
              const meta = ALERT_META[a.type] || ALERT_META.market;
              return (
                <View
                  key={a.id}
                  style={[
                    styles.card,
                    { borderLeftWidth: a.urgent ? 3 : 1, borderLeftColor: a.urgent ? Colors.warn : Colors.line },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                    <Icon name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.pillRow}>
                      <View style={[styles.pill, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.pillText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                      {a.urgent && (
                        <View style={[styles.pill, { backgroundColor: '#FDECEA' }]}>
                          <Text style={[styles.pillText, { color: Colors.warn }]}>Urgent</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.alertTitle}>{a.title}</Text>
                    <Text style={styles.alertMeta}>{a.location_name}</Text>
                    <Text style={styles.alertBody}>{a.body}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,32,26,0.45)',
  },
  sheet: {
    backgroundColor: Colors.bgCream,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '82%',
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: Colors.line,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkMute,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.ink, marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  pillRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  pill: {
    borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3,
  },
  pillText: { fontSize: 10, fontWeight: '700' },
  alertTitle: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  alertMeta: { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  alertBody: { fontSize: 13, color: Colors.inkSoft, marginTop: 6, lineHeight: 18 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 48 },
  emptyText: { fontSize: 14, color: Colors.inkMute },
});
