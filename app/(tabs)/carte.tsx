import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Modal,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/Icon';
import { AppHeader } from '@/components/AppHeader';
import { AlertsModal } from '@/components/AlertsModal';
import { ProfileModal } from '@/components/ProfileModal';
import { useAuthStore } from '@/store/authStore';
import { zonesApi } from '@/services/api';
import { ZONE_CATS, Zone } from '@/constants/zones';

export default function CarteScreen() {
  const { user, logout } = useAuthStore();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [mapRef, setMapRef] = useState<MapView | null>(null);

  const { data: zonesData } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zonesApi.list().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const zones: Zone[] = zonesData || [];

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return zones
      .filter((z) => z.name.toLowerCase().includes(q) || z.crop.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, zones]);

  const flyTo = (zone: Zone) => {
    setQuery(zone.name);
    mapRef?.animateToRegion({
      latitude: zone.lat,
      longitude: zone.lng,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    }, 800);
    setTimeout(() => setSelectedZone(zone), 900);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        user={user}
        onBellPress={() => setAlertsOpen(true)}
        onAvatarPress={() => setProfileOpen(true)}
      />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une zone (ex : Kaolack, Tomate…)"
            style={styles.searchInput}
            placeholderTextColor={Colors.inkMute}
          />
          <TouchableOpacity
            onPress={() => suggestions[0] && flyTo(suggestions[0])}
            style={styles.searchBtn}
          >
            <Icon name="pin" size={20} color={Colors.green} />
          </TouchableOpacity>
        </View>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map((z, i) => {
              const cat = ZONE_CATS[z.category];
              return (
                <TouchableOpacity
                  key={z.id}
                  onPress={() => flyTo(z)}
                  style={[styles.suggestion, i < suggestions.length - 1 && styles.suggestionBorder]}
                >
                  <View style={[styles.dot, { backgroundColor: cat.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sugName}>{z.name}</Text>
                    <Text style={styles.sugSub}>{z.crop} · {cat.label}</Text>
                  </View>
                  <Icon name="pin" size={14} color={Colors.inkMute} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={(ref) => setMapRef(ref)}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: 14.5,
            longitude: -14.5,
            latitudeDelta: 6,
            longitudeDelta: 6,
          }}
        >
          {zones.map((z) => {
            const cat = ZONE_CATS[z.category];
            return (
              <React.Fragment key={z.id}>
                <Circle
                  center={{ latitude: z.lat, longitude: z.lng }}
                  radius={12000}
                  fillColor={cat.color + 'AA'}
                  strokeColor={cat.color}
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{ latitude: z.lat, longitude: z.lng }}
                  onPress={() => setSelectedZone(z)}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={[styles.marker, { backgroundColor: cat.color }]}>
                    <Text style={styles.markerText}>{z.profitability_score}</Text>
                  </View>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendTitle}>
            <Icon name="pin" size={13} color={Colors.green} />
            <Text style={styles.legendTitleText}>Légende</Text>
          </View>
          {Object.values(ZONE_CATS).map((c) => (
            <View key={c.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: c.color }]} />
              <Text style={styles.legendLabel}>{c.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Zone detail modal */}
      <ZoneDetailModal zone={selectedZone} onClose={() => setSelectedZone(null)} />

      <AlertsModal visible={alertsOpen} onClose={() => setAlertsOpen(false)} />
      <ProfileModal
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onLogout={logout}
      />
    </SafeAreaView>
  );
}

function ZoneDetailModal({ zone, onClose }: { zone: Zone | null; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  if (!zone) return null;
  const cat = ZONE_CATS[zone.category];

  return (
    <Modal visible={!!zone} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.zoneOverlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.zoneModal}>
        <View style={styles.zoneHeader}>
          <Text style={styles.zoneName}>{zone.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.zoneCloseBtn}>
            <Icon name="close" size={16} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>

        <View style={[styles.catBadge, { backgroundColor: cat.color }]}>
          <Text style={styles.catBadgeText}>{cat.label}</Text>
        </View>

        <View style={styles.zoneCards}>
          <View style={[styles.zoneCard, { backgroundColor: Colors.greenSoft }]}>
            <Text style={styles.zoneCardLabel}>Culture Principale</Text>
            <Text style={styles.zoneCardValue}>{zone.crop}</Text>
          </View>
          <View style={[styles.zoneCard, { backgroundColor: Colors.greenSoft }]}>
            <Text style={styles.zoneCardLabel}>Score de Rentabilité</Text>
            <Text style={[styles.zoneCardBig, { color: Colors.greenDeep }]}>{zone.profitability_score}%</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreFill, { width: `${zone.profitability_score}%` as any, backgroundColor: cat.color }]} />
            </View>
          </View>

          {expanded && (
            <>
              <View style={[styles.zoneCard, { backgroundColor: Colors.bgCard }]}>
                <Text style={styles.zoneCardLabel}>NDVI · Végétation</Text>
                <Text style={styles.zoneCardValue}>{zone.ndvi?.toFixed(2) || '0.72'}</Text>
              </View>
              <View style={[styles.zoneCard, { backgroundColor: Colors.bgCard }]}>
                <Text style={styles.zoneCardLabel}>Humidité sol</Text>
                <Text style={styles.zoneCardValue}>{zone.soil_humidity?.toFixed(0) || '64'}%</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity onPress={() => setExpanded((v) => !v)} style={styles.expandBtn}>
          <Text style={styles.expandBtnText}>{expanded ? 'Réduire' : 'Voir les détails'}</Text>
          <Icon name={expanded ? 'arrow-left' : 'arrow'} size={16} color={Colors.clay} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCream },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 12, zIndex: 1000 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', height: 50,
    backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: Colors.green,
    borderRadius: 14, paddingLeft: 16, paddingRight: 8,
    shadowColor: Colors.greenDeep, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  searchBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.greenSoft, alignItems: 'center', justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute', left: 16, right: 16, top: 54,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 14, overflow: 'hidden', zIndex: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
  },
  suggestion: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sugName: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  sugSub: { fontSize: 11.5, color: Colors.inkMute },
  mapContainer: {
    flex: 1, marginHorizontal: 16, marginBottom: 14,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.line,
  },
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  marker: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  markerText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  legend: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: Colors.bgCard, borderRadius: 12,
    padding: 10, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  legendTitle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendTitleText: { fontSize: 11, fontWeight: '700', color: Colors.ink },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 11, height: 11, borderRadius: 5.5, borderWidth: 1.5, borderColor: Colors.white },
  legendLabel: { fontSize: 10.5, color: Colors.inkSoft, fontWeight: '600' },
  zoneOverlay: { flex: 1, backgroundColor: 'rgba(20,32,26,0.4)' },
  zoneModal: {
    backgroundColor: Colors.bgCard, borderRadius: 22,
    marginHorizontal: 20, padding: 20,
    position: 'absolute', bottom: 100, left: 0, right: 0,
  },
  zoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zoneName: { fontSize: 24, fontWeight: '800', color: Colors.ink },
  zoneCloseBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.bgMuted, alignItems: 'center', justifyContent: 'center',
  },
  catBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 50, marginTop: 10,
  },
  catBadgeText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  zoneCards: { marginTop: 14, gap: 10 },
  zoneCard: { borderRadius: 14, padding: 14 },
  zoneCardLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.greenDeep,
    textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.8,
  },
  zoneCardValue: { fontSize: 22, fontWeight: '800', color: Colors.greenDeep, marginTop: 4 },
  zoneCardBig: { fontSize: 34, fontWeight: '900', marginTop: 4 },
  scoreBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(31,78,54,0.12)', marginTop: 8, overflow: 'hidden' },
  scoreFill: { height: '100%' },
  expandBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 14, height: 44, borderRadius: 50,
    backgroundColor: Colors.claySoft,
  },
  expandBtnText: { fontSize: 14, fontWeight: '700', color: Colors.clay },
});
