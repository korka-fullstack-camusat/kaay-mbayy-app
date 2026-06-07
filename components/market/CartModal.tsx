import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Icon } from '../Icon';
import { useCartStore } from '@/store/cartStore';
import { ordersApi } from '@/services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CartModal({ visible, onClose }: Props) {
  const { items, addToCart, removeFromCart, clearCart, totalXof } = useCartStore();
  const [loading, setLoading] = useState(false);

  const total = totalXof();
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  const validate = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      await ordersApi.create({
        items: items.map((i) => ({
          product_id: i.product.id,
          qty_kg: i.qty,
        })),
      });
      clearCart();
      onClose();
      Alert.alert('Commande confirmée !', 'Votre commande a été transmise aux vendeurs.');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>{itemCount} article(s)</Text>
            <Text style={styles.title}>Mon panier</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={18} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="cart" size={40} color={Colors.inkMute} />
            <Text style={styles.emptyText}>Votre panier est vide</Text>
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
              {items.map(({ product, qty }) => (
                <View key={product.id} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{product.crop}</Text>
                    <Text style={styles.itemLoc}>{product.location}</Text>
                  </View>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => removeFromCart(product.id)} style={styles.qtyBtn}>
                      <Icon name="minus" size={14} color={Colors.ink} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty} kg</Text>
                    <TouchableOpacity onPress={() => addToCart(product)} style={[styles.qtyBtn, { backgroundColor: Colors.green }]}>
                      <Icon name="plus" size={14} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemPrice}>
                    {(product.price_xof_per_kg * qty).toLocaleString()} XOF
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{total.toLocaleString()} XOF</Text>
              </View>
              <TouchableOpacity
                onPress={validate}
                disabled={loading}
                style={[styles.validateBtn, loading && { opacity: 0.6 }]}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Icon name="check" size={18} color={Colors.white} />
                    <Text style={styles.validateText}>Confirmer la commande</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(20,32,26,0.45)' },
  sheet: {
    backgroundColor: Colors.bgCream,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    maxHeight: '82%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.line,
    borderRadius: 2, alignSelf: 'center', marginTop: 14, marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12,
  },
  eyebrow: { fontSize: 11, fontWeight: '700', color: Colors.inkMute, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '800', color: Colors.ink, marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgMuted, alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.inkMute },
  cartItem: {
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.line,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  itemName: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  itemLoc: { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgMuted, alignItems: 'center', justifyContent: 'center',
  },
  qtyText: { fontSize: 13, fontWeight: '700', color: Colors.ink, minWidth: 40, textAlign: 'center' },
  itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.greenDeep },
  footer: { padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: Colors.line },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '600', color: Colors.inkSoft },
  totalValue: { fontSize: 22, fontWeight: '800', color: Colors.greenDeep },
  validateBtn: {
    backgroundColor: Colors.green, height: 54, borderRadius: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  validateText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
