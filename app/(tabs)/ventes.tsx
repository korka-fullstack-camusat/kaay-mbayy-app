import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, FlatList,
  ActivityIndicator, Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/Icon';
import { AppHeader } from '@/components/AppHeader';
import { AlertsModal } from '@/components/AlertsModal';
import { ProfileModal } from '@/components/ProfileModal';
import { PublishModal } from '@/components/market/PublishModal';
import { useAuthStore } from '@/store/authStore';
import { useVentesStore } from '@/store/ventesStore';
import { productsApi, ordersApi } from '@/services/api';

type Tab = 'listings' | 'received';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'En attente',  color: '#92400E', bg: '#FEF3C7', icon: 'bell'  },
  confirmed: { label: 'Confirmée',   color: Colors.ok, bg: Colors.greenSoft, icon: 'check' },
  cancelled: { label: 'Annulée',     color: '#B91C1C', bg: '#FEE2E2', icon: 'close' },
  shipped:   { label: 'En route',    color: Colors.clay, bg: Colors.claySoft, icon: 'arrow' },
  delivered: { label: 'Livrée',      color: Colors.greenDeep, bg: Colors.greenSoft, icon: 'check' },
};

/* ─── Mes annonces ───────────────────────────────────────── */
function ListingsTab({ defaultLocation }: { defaultLocation?: string }) {
  const qc = useQueryClient();
  const [publishOpen, setPublishOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: () => productsApi.mine().then((r) => r.data),
    staleTime: 30_000,
  });

  const listings: any[] = data || [];

  const handleDelete = (id: number) => {
    Alert.alert('Retirer l\'annonce', 'Cette annonce sera retirée du marché. Confirmer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer', style: 'destructive',
        onPress: async () => {
          try {
            await productsApi.delete(id);
            qc.invalidateQueries({ queryKey: ['my-products'] });
            qc.invalidateQueries({ queryKey: ['products'] });
          } catch (e: any) { Alert.alert('Erreur', e.message); }
        },
      },
    ]);
  };

  if (isLoading) return <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />;

  return (
    <>
      <TouchableOpacity onPress={() => setPublishOpen(true)} style={styles.publishBtn}>
        <Icon name="plus" size={16} color={Colors.white} />
        <Text style={styles.publishBtnText}>Publier un produit</Text>
      </TouchableOpacity>

      {listings.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="store" size={40} color={Colors.inkMute} />
          <Text style={styles.emptyTitle}>Aucune annonce publiée</Text>
          <Text style={styles.emptyText}>
            Publiez vos récoltes pour les vendre{'\n'}directement aux acheteurs.
          </Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(i) => i.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.listingCard, !item.is_active && styles.listingInactive]}>
              <View style={styles.listingLeft}>
                <Text style={styles.listingCrop}>{item.crop}</Text>
                <Text style={styles.listingPrice}>{item.price_xof_per_kg.toLocaleString()} XOF/kg</Text>
                <Text style={styles.listingQty}>{item.qty_kg.toLocaleString()} kg · {item.location}</Text>
              </View>
              <View style={styles.listingRight}>
                <View style={[styles.statusPill,
                  { backgroundColor: item.is_active ? Colors.greenSoft : '#FEE2E2' }
                ]}>
                  <Text style={[styles.statusText,
                    { color: item.is_active ? Colors.greenDeep : '#B91C1C' }
                  ]}>
                    {item.is_active ? 'En ligne' : 'Retiré'}
                  </Text>
                </View>
                {item.is_active && (
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Icon name="close" size={14} color={Colors.inkMute} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <PublishModal visible={publishOpen} onClose={() => setPublishOpen(false)} defaultLocation={defaultLocation} />
    </>
  );
}

/* ─── Commandes reçues ───────────────────────────────────── */
function ReceivedOrdersTab() {
  const qc = useQueryClient();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  /* La query est partagée avec VentesScreen via le même queryKey.
     TanStack Query déduplique les requêtes réseau — pas de double appel. */
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders-received'],
    queryFn: () => ordersApi.received().then((r) => r.data),
    staleTime: 20_000,
    refetchInterval: 2 * 60 * 1000,
  });

  const orders: any[] = data || [];

  const handleAction = async (orderId: number, status: 'confirmed' | 'cancelled') => {
    const label = status === 'confirmed' ? 'confirmer' : 'refuser';
    Alert.alert(
      status === 'confirmed' ? '✅ Confirmer la commande' : '❌ Refuser la commande',
      `Voulez-vous vraiment ${label} cette commande ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: status === 'confirmed' ? 'Confirmer' : 'Refuser',
          style: status === 'cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            setActionLoading(orderId);
            try {
              await ordersApi.updateStatus(orderId, status);
              qc.invalidateQueries({ queryKey: ['orders-received'] });
            } catch (e: any) {
              Alert.alert('Erreur', e.message);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) return <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />;

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="bell" size={40} color={Colors.inkMute} />
        <Text style={styles.emptyTitle}>Aucune commande reçue</Text>
        <Text style={styles.emptyText}>
          Vous serez notifié dès qu'un{'\n'}acheteur commande vos produits.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      onRefresh={refetch}
      refreshing={isFetching}
      renderItem={({ item: order }) => {
        const st = STATUS_MAP[order.status] || { label: order.status, color: Colors.inkMute, bg: Colors.bgMuted, icon: 'bell' };
        const isPending = order.status === 'pending';
        const isActing = actionLoading === order.id;
        const dateStr = order.created_at
          ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
          : '';

        return (
          <View style={[styles.orderCard, isPending && styles.orderCardPending]}>
            {/* En-tête */}
            <View style={styles.orderHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>Commande #{order.id}</Text>
                {dateStr ? <Text style={styles.orderDate}>{dateStr}</Text> : null}
              </View>
              <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>

            {/* Articles */}
            {(order.items || []).map((item: any) => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.orderItemName}>{item.product_name}</Text>
                <Text style={styles.orderItemDetail}>
                  {item.qty_kg} kg × {item.unit_price_xof.toLocaleString()} XOF
                </Text>
              </View>
            ))}

            {/* Total */}
            <View style={styles.orderTotalRow}>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotalValue}>{order.total_xof.toLocaleString()} XOF</Text>
            </View>

            {/* Boutons action — seulement pour les commandes en attente */}
            {isPending && (
              <View style={styles.actionRow}>
                {isActing ? (
                  <ActivityIndicator color={Colors.green} style={{ flex: 1, height: 44 }} />
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleAction(order.id, 'cancelled')}
                      style={styles.refuseBtn}
                    >
                      <Icon name="close" size={15} color="#B91C1C" />
                      <Text style={styles.refuseBtnText}>Refuser</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAction(order.id, 'confirmed')}
                      style={styles.confirmBtn}
                    >
                      <Icon name="check" size={15} color={Colors.white} strokeWidth={2.5} />
                      <Text style={styles.confirmBtnText}>Confirmer</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

/* ─── Écran principal Ventes ─────────────────────────────── */
export default function VentesScreen() {
  const { user, logout } = useAuthStore();
  const { hasNewOrders, lastSeenOrderCount, signalNewOrder, markOrdersSeen } = useVentesStore();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('listings');

  /* ── Query toujours active (même quand sur "Mes annonces") ── */
  const { data: receivedData } = useQuery({
    queryKey: ['orders-received'],
    queryFn: () => ordersApi.received().then((r) => r.data),
    staleTime: 20_000,
    refetchInterval: 2 * 60 * 1000,
  });

  const receivedOrders: any[] = receivedData || [];

  /* Détecter nouvelles commandes dès réception, quel que soit l'onglet actif */
  useEffect(() => {
    if (!receivedData) return;
    if (lastSeenOrderCount >= 0 && receivedOrders.length > lastSeenOrderCount) {
      signalNewOrder();
    }
  }, [receivedData]);

  /* Si l'écran reprend le focus et que l'utilisateur est déjà sur "Commandes reçues" */
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'received') {
        markOrdersSeen(receivedOrders.length);
      }
    }, [activeTab, receivedOrders.length])
  );

  /* Appui sur "Commandes reçues" → effacer le badge immédiatement */
  const handleReceivedTabPress = () => {
    setActiveTab('received');
    markOrdersSeen(receivedOrders.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        user={user}
        onBellPress={() => setAlertsOpen(true)}
        onAvatarPress={() => setProfileOpen(true)}
      />

      <View style={styles.pageHeader}>
        <Text style={styles.eyebrow}>Espace vendeur</Text>
        <Text style={styles.pageTitle}>Mes ventes</Text>
      </View>

      {/* Onglets */}
      <View style={styles.tabRow}>
        {/* Mes annonces */}
        <TouchableOpacity
          onPress={() => setActiveTab('listings')}
          style={[styles.tabPill, activeTab === 'listings' && styles.tabPillActive]}
        >
          <Icon name="store" size={13} color={activeTab === 'listings' ? Colors.white : Colors.inkSoft} />
          <Text style={[styles.tabPillText, activeTab === 'listings' && styles.tabPillTextActive]}>
            Mes annonces
          </Text>
        </TouchableOpacity>

        {/* Commandes reçues avec badge */}
        <TouchableOpacity
          onPress={handleReceivedTabPress}
          style={[styles.tabPill, activeTab === 'received' && styles.tabPillActive]}
        >
          <View>
            <Icon name="bell" size={13} color={activeTab === 'received' ? Colors.white : Colors.inkSoft} />
            {hasNewOrders && activeTab !== 'received' && (
              <View style={styles.tabBadge} />
            )}
          </View>
          <Text style={[styles.tabPillText, activeTab === 'received' && styles.tabPillTextActive]}>
            Commandes reçues
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'listings' && <ListingsTab defaultLocation={user?.location ?? undefined} />}
        {activeTab === 'received' && <ReceivedOrdersTab />}
      </View>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCream },

  pageHeader: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: Colors.inkMute, textTransform: 'uppercase', letterSpacing: 0.5 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.ink, marginTop: 2 },

  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  tabPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 50,
    borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.bgCard,
  },
  tabPillActive: { backgroundColor: Colors.greenDeep, borderColor: Colors.greenDeep },
  tabPillText: { fontSize: 13, fontWeight: '600', color: Colors.inkSoft },
  tabPillTextActive: { color: Colors.white },
  tabBadge: {
    position: 'absolute', top: -3, right: -3,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1, borderColor: Colors.bgCard,
  },

  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.ink },
  emptyText: { fontSize: 13, color: Colors.inkMute, textAlign: 'center', lineHeight: 20 },

  publishBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.green, height: 48, borderRadius: 50,
    marginHorizontal: 20, marginBottom: 14, justifyContent: 'center',
  },
  publishBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  /* Annonces */
  listingCard: {
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.line,
    padding: 14, flexDirection: 'row', alignItems: 'center',
  },
  listingInactive: { opacity: 0.5 },
  listingLeft: { flex: 1, gap: 2 },
  listingCrop: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  listingPrice: { fontSize: 13, fontWeight: '700', color: Colors.greenDeep },
  listingQty: { fontSize: 11, color: Colors.inkMute },
  listingRight: { alignItems: 'center', gap: 8, marginLeft: 10 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  statusText: { fontSize: 10, fontWeight: '700' },
  deleteBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.bgMuted, alignItems: 'center', justifyContent: 'center',
  },

  /* Commandes */
  orderCard: {
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.line, padding: 16, gap: 10,
  },
  orderCardPending: {
    borderColor: '#FCD34D', borderWidth: 1.5,
  },
  orderHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  orderId: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  orderDate: { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  orderItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  orderItemName: { fontSize: 13, fontWeight: '600', color: Colors.ink },
  orderItemDetail: { fontSize: 12, color: Colors.inkMute },
  orderTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2,
  },
  orderTotalLabel: { fontSize: 12, color: Colors.inkSoft, fontWeight: '600' },
  orderTotalValue: { fontSize: 17, fontWeight: '800', color: Colors.greenDeep },

  /* Boutons action */
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  refuseBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 44, borderRadius: 50, borderWidth: 1.5, borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  refuseBtnText: { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 44, borderRadius: 50, backgroundColor: Colors.green,
  },
  confirmBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
});
