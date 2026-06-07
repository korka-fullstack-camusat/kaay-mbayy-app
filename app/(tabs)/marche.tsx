import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, FlatList, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/Icon';
import { AppHeader } from '@/components/AppHeader';
import { AlertsModal } from '@/components/AlertsModal';
import { ProfileModal } from '@/components/ProfileModal';
import { ProductCard, Product } from '@/components/market/ProductCard';
import { ProductDetailModal } from '@/components/market/ProductDetailModal';
import { CartModal } from '@/components/market/CartModal';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useMarketStore } from '@/store/marketStore';
import { productsApi, ordersApi } from '@/services/api';

type Tab = 'products' | 'orders';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: '⏳ En attente de validation', color: '#92400E', bg: '#FEF3C7' },
  confirmed: { label: '✅ Confirmée',                color: Colors.ok,       bg: Colors.greenSoft },
  cancelled: { label: '❌ Refusée',                  color: '#B91C1C',       bg: '#FEE2E2' },
  shipped:   { label: '🚚 En route',                 color: Colors.clay,     bg: Colors.claySoft  },
  delivered: { label: '🎉 Livrée',                   color: Colors.greenDeep,bg: Colors.greenSoft },
};

/* ─── Onglet Produits ────────────────────────────────────── */
function ProductsTab({
  userId,
  onSelectProduct,
}: {
  userId?: number;
  onSelectProduct: (p: Product) => void;
}) {
  const { items, totalItems } = useCartStore();
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = totalItems();

  const { data, isLoading } = useQuery({
    queryKey: ['products', query],
    queryFn: () => productsApi.list(query || undefined).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
  });

  const products: Product[] = (data || []).filter(
    (p: Product) => !userId || p.seller_id !== userId
  );

  const getCartQty = (id: number) => items.find((i) => i.product.id === id)?.qty;

  return (
    <>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <View style={styles.searchIcon}>
            <Icon name="search" size={18} color={Colors.inkMute} />
          </View>
          <TextInput
            placeholder="Oignon, arachide, Kaolack…"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholderTextColor={Colors.inkMute}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Icon name="close" size={16} color={Colors.inkMute} />
            </TouchableOpacity>
          )}
        </View>
        {cartCount > 0 && (
          <TouchableOpacity onPress={() => setCartOpen(true)} style={styles.cartBtn}>
            <Icon name="cart" size={16} color={Colors.white} />
            <Text style={styles.cartBtnText}>{Math.floor(cartCount / 10)}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="search" size={36} color={Colors.inkMute} />
          <Text style={styles.emptyTitle}>
            {query ? `Aucun résultat pour « ${query} »` : 'Aucun produit disponible'}
          </Text>
          {!query && (
            <Text style={styles.emptyText}>
              Les autres agriculteurs publieront{'\n'}leurs produits bientôt.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              inCartQty={getCartQty(item.id)}
              onPress={() => onSelectProduct(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CartModal visible={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

/* ─── Onglet Mes commandes ───────────────────────────────── */
function MyOrdersTab() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const orders: any[] = data || [];

  if (isLoading) return <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />;

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="cart" size={40} color={Colors.inkMute} />
        <Text style={styles.emptyTitle}>Aucune commande</Text>
        <Text style={styles.emptyText}>
          Vos achats sur le marché{'\n'}apparaîtront ici.
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
        const st = STATUS_MAP[order.status] || {
          label: order.status, color: Colors.inkMute, bg: Colors.bgMuted,
        };
        const dateStr = order.created_at
          ? new Date(order.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : '';

        return (
          <View style={[styles.orderCard,
            order.status === 'confirmed' && styles.orderCardConfirmed,
            order.status === 'cancelled' && styles.orderCardCancelled,
          ]}>
            {/* En-tête */}
            <View style={styles.orderHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>Commande #{order.id}</Text>
                {dateStr ? <Text style={styles.orderDate}>{dateStr}</Text> : null}
              </View>
            </View>

            {/* Statut bien visible */}
            <View style={[styles.statusBanner, { backgroundColor: st.bg }]}>
              <Text style={[styles.statusBannerText, { color: st.color }]}>{st.label}</Text>
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
          </View>
        );
      }}
    />
  );
}

/* ─── Écran principal Marché ─────────────────────────────── */
export default function MarcheScreen() {
  const { user, logout } = useAuthStore();
  const { addToCart, removeFromCart, items } = useCartStore();
  const {
    lastSeenCount, signalNew, markSeen,
    hasOrderUpdate, checkOrderStatuses, markOrdersSeen,
  } = useMarketStore();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('products');

  const getCartQty = (id: number) => items.find((i) => i.product.id === id)?.qty;

  /* ── Détection de nouveaux produits en arrière-plan ── */
  const { data: allProductsData } = useQuery({
    queryKey: ['products', ''],
    queryFn: () => productsApi.list().then((r) => r.data),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
  });

  const otherProductsCount = (allProductsData || []).filter(
    (p: Product) => !user?.id || p.seller_id !== user.id
  ).length;

  useEffect(() => {
    if (!allProductsData) return;
    if (lastSeenCount >= 0 && otherProductsCount > lastSeenCount) {
      signalNew();
    }
  }, [allProductsData]);

  /* ── Détection changements de statut commandes acheteur ── */
  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 60_000,         // poll en arrière-plan, toujours actif
  });

  const buyerOrders: any[] = ordersData || [];

  useEffect(() => {
    if (!ordersData) return;
    checkOrderStatuses(buyerOrders);
  }, [ordersData]);

  /* ── Nettoyer les badges quand l'écran prend le focus ── */
  useFocusEffect(
    useCallback(() => {
      markSeen(otherProductsCount);
      // Si l'utilisateur est déjà sur "Mes commandes", effacer le badge
      if (activeTab === 'orders') {
        markOrdersSeen(buyerOrders);
      }
    }, [otherProductsCount, activeTab, buyerOrders.length])
  );

  /* Appuyé sur "Mes commandes" → effacer le badge immédiatement */
  const handleOrdersTabPress = () => {
    setActiveTab('orders');
    markOrdersSeen(buyerOrders);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        user={user}
        onBellPress={() => setAlertsOpen(true)}
        onAvatarPress={() => setProfileOpen(true)}
      />

      <View style={styles.pageHeader}>
        <Text style={styles.eyebrow}>Marché direct</Text>
        <Text style={styles.pageTitle}>Échanges agricoles</Text>
      </View>

      {/* Onglets */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('products')}
          style={[styles.tabPill, activeTab === 'products' && styles.tabPillActive]}
        >
          <Icon name="cart" size={13} color={activeTab === 'products' ? Colors.white : Colors.inkSoft} />
          <Text style={[styles.tabPillText, activeTab === 'products' && styles.tabPillTextActive]}>
            Produits
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOrdersTabPress}
          style={[styles.tabPill, activeTab === 'orders' && styles.tabPillActive]}
        >
          {/* Icône + badge rouge si commande validée/refusée */}
          <View>
            <Icon name="bell" size={13} color={activeTab === 'orders' ? Colors.white : Colors.inkSoft} />
            {hasOrderUpdate && activeTab !== 'orders' && (
              <View style={styles.tabBadge} />
            )}
          </View>
          <Text style={[styles.tabPillText, activeTab === 'orders' && styles.tabPillTextActive]}>
            Mes commandes
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'products' && (
          <ProductsTab userId={user?.id} onSelectProduct={setSelectedProduct} />
        )}
        {activeTab === 'orders' && <MyOrdersTab />}
      </View>

      <ProductDetailModal
        product={selectedProduct}
        inCartQty={selectedProduct ? getCartQty(selectedProduct.id) : undefined}
        onClose={() => setSelectedProduct(null)}
        onAdd={() => selectedProduct && addToCart(selectedProduct)}
        onRemove={() => selectedProduct && removeFromCart(selectedProduct.id)}
      />
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

  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  tabPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 50,
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

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, marginBottom: 12,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    height: 46, backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: 50, paddingLeft: 44, paddingRight: 16, position: 'relative',
  },
  searchIcon: { position: 'absolute', left: 14, top: 14 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  clearBtn: { padding: 4 },
  cartBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.clay, alignItems: 'center', justifyContent: 'center',
  },
  cartBtnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },

  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  emptyText: { fontSize: 13, color: Colors.inkMute, textAlign: 'center', lineHeight: 20 },

  /* Commandes acheteur */
  orderCard: {
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.line, padding: 16, gap: 8,
  },
  orderCardConfirmed: { borderColor: Colors.green, borderWidth: 1.5 },
  orderCardCancelled: { borderColor: '#FECACA', borderWidth: 1.5 },
  orderHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  orderId: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  orderDate: { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  statusBanner: {
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
  },
  statusBannerText: { fontSize: 13, fontWeight: '700' },
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
});
