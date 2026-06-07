import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  ScrollView, TextInput, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Icon } from '../Icon';
import { productsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultLocation?: string;
}

const KINDS = [
  { label: 'Oignon',   value: 'onion',  crop: 'Oignon',   color: '#8B4DAE' },
  { label: 'Arachide', value: 'peanut', crop: 'Arachide', color: '#9C7A2E' },
  { label: 'Tomate',   value: 'tomato', crop: 'Tomate',   color: '#D7382C' },
  { label: 'Mil',      value: 'millet', crop: 'Mil',      color: '#C8A93C' },
  { label: 'Niébé',   value: 'cowpea', crop: 'Niébé',   color: '#5C8A3A' },
  { label: 'Riz',      value: 'rice',   crop: 'Riz',      color: '#4E9A6A' },
];

export function PublishModal({ visible, onClose, defaultLocation = '' }: Props) {
  const qc = useQueryClient();
  const [kind, setKind] = useState('peanut');
  const [crop, setCrop] = useState('Arachide');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const selectKind = (k: typeof KINDS[0]) => {
    setKind(k.value);
    setCrop(k.crop);
  };

  const reset = () => {
    setKind('peanut'); setCrop('Arachide');
    setQty(''); setPrice('');
    setLocation(defaultLocation); setDescription('');
  };

  const handleClose = () => { reset(); onClose(); };

  const canSubmit = crop.trim() && qty.trim() && price.trim() && location.trim();

  const submit = async () => {
    if (!canSubmit) return;
    const qtyNum = parseFloat(qty);
    const priceNum = parseFloat(price);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('Erreur', 'Quantité invalide'); return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Erreur', 'Prix invalide'); return;
    }
    setLoading(true);
    try {
      await productsApi.create({
        kind,
        crop: crop.trim(),
        location: location.trim(),
        qty_kg: qtyNum,
        price_xof_per_kg: priceNum,
        description: description.trim() || null,
      });
      await qc.invalidateQueries({ queryKey: ['products'] });
      await qc.invalidateQueries({ queryKey: ['my-products'] });
      Alert.alert('Publié !', 'Votre annonce est maintenant visible sur le marché.');
      handleClose();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Nouvelle annonce</Text>
            <Text style={styles.title}>Publier un produit</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Icon name="close" size={18} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Kind selector */}
          <Text style={styles.label}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.kindRow}>
              {KINDS.map((k) => (
                <TouchableOpacity
                  key={k.value}
                  onPress={() => selectKind(k)}
                  style={[styles.kindPill, kind === k.value && { backgroundColor: k.color, borderColor: k.color }]}
                >
                  <Text style={[styles.kindPillText, kind === k.value && { color: Colors.white }]}>
                    {k.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Crop name */}
          <Text style={styles.label}>Nom du produit</Text>
          <TextInput
            value={crop}
            onChangeText={setCrop}
            placeholder="Ex: Oignon violet de Podor"
            style={styles.input}
            placeholderTextColor={Colors.inkMute}
          />

          {/* Qty + Price */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Quantité (kg)</Text>
              <TextInput
                value={qty}
                onChangeText={setQty}
                placeholder="500"
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={Colors.inkMute}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Prix (XOF/kg)</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="250"
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={Colors.inkMute}
              />
            </View>
          </View>

          {/* Location */}
          <Text style={styles.label}>Localisation</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Kaolack, Thiès…"
            style={styles.input}
            placeholderTextColor={Colors.inkMute}
          />

          {/* Description */}
          <Text style={styles.label}>Description <Text style={styles.labelOpt}>(optionnel)</Text></Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Qualité, conditionnement, disponibilité…"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.inputMulti]}
            placeholderTextColor={Colors.inkMute}
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Submit */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={submit}
            disabled={!canSubmit || loading}
            style={[styles.submitBtn, (!canSubmit || loading) && { opacity: 0.5 }]}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Icon name="plus" size={18} color={Colors.white} />
                <Text style={styles.submitText}>Publier l'annonce</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(20,32,26,0.45)' },
  sheet: {
    backgroundColor: Colors.bgCream,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.line,
    borderRadius: 2, alignSelf: 'center', marginTop: 14, marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 4,
  },
  eyebrow: { fontSize: 11, fontWeight: '700', color: Colors.inkMute, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.ink, marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgMuted, alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: 20, paddingTop: 12, gap: 4 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.inkSoft, marginBottom: 6, marginTop: 8 },
  labelOpt: { fontWeight: '400', color: Colors.inkMute },
  input: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.ink,
  },
  inputMulti: { minHeight: 80, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 10 },
  kindRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 2 },
  kindPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50,
    borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.bgCard,
  },
  kindPillText: { fontSize: 13, fontWeight: '600', color: Colors.ink },
  footer: {
    padding: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.line,
  },
  submitBtn: {
    backgroundColor: Colors.green, height: 54, borderRadius: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
