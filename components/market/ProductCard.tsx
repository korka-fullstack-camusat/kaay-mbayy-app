import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Icon } from '../Icon';

export interface Product {
  id: number;
  seller_id: number;
  kind: string;
  crop: string;
  location: string;
  qty_kg: number;
  price_xof_per_kg: number;
  stars: number;
  description?: string;
  is_verified: boolean;
  is_active: boolean;
  seller_name?: string;
}

const KIND_COLORS: Record<string, { bg: string; fg: string }> = {
  onion:  { bg: '#EFE2F4', fg: '#8B4DAE' },
  peanut: { bg: '#F3E7C9', fg: '#9C7A2E' },
  tomato: { bg: '#FADBD8', fg: '#D7382C' },
  millet: { bg: '#F4ECC9', fg: '#C8A93C' },
  cowpea: { bg: '#E4EFD8', fg: '#5C8A3A' },
  rice:   { bg: '#E0EEE6', fg: '#4E9A6A' },
};

function KindDot({ kind }: { kind: string }) {
  const c = KIND_COLORS[kind] || { bg: Colors.bgMuted, fg: Colors.ink };
  const letter = kind.charAt(0).toUpperCase();
  return (
    <View style={[styles.kindDot, { backgroundColor: c.bg }]}>
      <Text style={[styles.kindLetter, { color: c.fg }]}>{letter}</Text>
    </View>
  );
}

interface Props {
  product: Product;
  inCartQty?: number;
  onPress: () => void;
}

export function ProductCard({ product: p, inCartQty, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <KindDot kind={p.kind} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cropName}>{p.crop}</Text>
        <Text style={styles.qtyText}>{p.qty_kg.toLocaleString()} kg dispo</Text>
        <Text style={styles.priceText}>
          {p.price_xof_per_kg.toLocaleString()}
          <Text style={styles.unitText}> XOF/kg</Text>
        </Text>
      </View>
      <View style={{ alignItems: 'center', gap: 4 }}>
        {inCartQty !== undefined && inCartQty > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{inCartQty} kg ✓</Text>
          </View>
        )}
        <Icon name="arrow" size={18} color={Colors.inkMute} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kindDot: {
    width: 68, height: 68, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  kindLetter: { fontSize: 28, fontWeight: '800' },
  cropName: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  qtyText: { fontSize: 12, color: Colors.inkMute, marginTop: 2 },
  priceText: { fontSize: 18, fontWeight: '800', color: Colors.greenDeep, marginTop: 4 },
  unitText: { fontSize: 11, color: Colors.inkMute, fontWeight: '400' },
  cartBadge: {
    backgroundColor: Colors.greenSoft,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50,
  },
  cartBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.greenDeep },
});
