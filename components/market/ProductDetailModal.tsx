import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Icon } from '../Icon';
import { Product } from './ProductCard';

interface Props {
  product: Product | null;
  inCartQty?: number;
  onClose: () => void;
  onAdd: () => void;
  onRemove: () => void;
}

export function ProductDetailModal({ product: p, inCartQty = 0, onClose, onAdd, onRemove }: Props) {
  if (!p) return null;

  const sellerInitials = (p.seller_name || '??')
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Modal visible={!!p} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <ScrollView>
          {/* Header */}
          <View style={styles.topBar}>
            <View style={styles.handle} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={18} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 20, gap: 16 }}>
            {/* Title & Price */}
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cropName}>{p.crop}</Text>
                <View style={styles.locationRow}>
                  <Icon name="pin" size={13} color={Colors.inkMute} />
                  <Text style={styles.locationText}>{p.location}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{p.price_xof_per_kg.toLocaleString()}</Text>
                <Text style={styles.unit}>XOF/kg</Text>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.badgeRow}>
              {p.is_verified && (
                <View style={[styles.badge, { backgroundColor: Colors.greenSoft }]}>
                  <Icon name="check" size={11} color={Colors.green} strokeWidth={2.5} />
                  <Text style={[styles.badgeText, { color: Colors.green }]}>Vérifié IA</Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: Colors.goldSoft }]}>
                <Icon name="star" size={11} color={Colors.gold} />
                <Text style={[styles.badgeText, { color: Colors.gold }]}>{p.stars.toFixed(1)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: Colors.bgMuted }]}>
                <Text style={[styles.badgeText, { color: Colors.inkSoft }]}>
                  {p.qty_kg.toLocaleString()} kg
                </Text>
              </View>
            </View>

            {/* Seller */}
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitials}>{sellerInitials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sellerLabel}>Vendeur</Text>
                <Text style={styles.sellerName}>{p.seller_name}</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Icon name="phone" size={14} color={Colors.green} />
                <Text style={styles.callText}>Appeler</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            {p.description && (
              <View>
                <Text style={styles.sectionLabel}>Description</Text>
                <Text style={styles.description}>{p.description}</Text>
              </View>
            )}

            {/* Cart */}
            {inCartQty > 0 ? (
              <View style={styles.cartRow}>
                <Text style={styles.inCartText}>Dans le panier · {inCartQty} kg</Text>
                <TouchableOpacity onPress={onRemove} style={styles.qtyBtn}>
                  <Icon name="minus" size={16} color={Colors.ink} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onAdd} style={[styles.qtyBtn, { backgroundColor: Colors.green }]}>
                  <Icon name="plus" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
                <Icon name="plus" size={18} color={Colors.white} />
                <Text style={styles.addBtnText}>Ajouter au panier</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(20,32,26,0.45)' },
  sheet: {
    backgroundColor: Colors.bgCream,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    maxHeight: '90%',
  },
  topBar: { alignItems: 'center', paddingTop: 14, paddingHorizontal: 20 },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.line,
    borderRadius: 2, marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute', right: 20, top: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgMuted, alignItems: 'center', justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cropName: { fontSize: 24, fontWeight: '800', color: Colors.ink },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 12, color: Colors.inkMute },
  price: { fontSize: 22, fontWeight: '800', color: Colors.greenDeep },
  unit: { fontSize: 11, color: Colors.inkMute },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  sellerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.line, padding: 12,
  },
  sellerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center',
  },
  sellerInitials: { color: '#F6E0B0', fontWeight: '700', fontSize: 14 },
  sellerLabel: { fontSize: 10, fontWeight: '700', color: Colors.inkMute, textTransform: 'uppercase' },
  sellerName: { fontSize: 14, fontWeight: '700', color: Colors.ink, marginTop: 2 },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.greenSoft,
  },
  callText: { fontSize: 12, fontWeight: '700', color: Colors.green },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.inkMute,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  description: { fontSize: 14, color: Colors.inkSoft, lineHeight: 20 },
  cartRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.greenSoft, borderRadius: 50,
    paddingLeft: 16, paddingRight: 8, paddingVertical: 8, gap: 8,
  },
  inCartText: { flex: 1, color: Colors.greenDeep, fontWeight: '700', fontSize: 14 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.clay, height: 52, borderRadius: 50,
  },
  addBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
