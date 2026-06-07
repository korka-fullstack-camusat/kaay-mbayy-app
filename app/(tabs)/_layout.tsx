import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/Icon';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useMarketStore } from '@/store/marketStore';
import { useVentesStore } from '@/store/ventesStore';

export default function TabsLayout() {
  const { token, isLoaded } = useAuthStore();
  const insets = useSafeAreaInsets();

  if (isLoaded && !token) {
    return <Redirect href="/(auth)" />;
  }

  // Sur Android, on ajoute la hauteur de la barre de navigation système
  // (boutons retour / home / récents) + 8px de respiration
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 0) + 12
    : Math.max(insets.bottom, 8);

  const tabBarHeight = 58 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopWidth: 1,
          borderTopColor: Colors.line,
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarActiveTintColor: Colors.clay,
        tabBarInactiveTintColor: Colors.inkMute,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Icon name="home" size={24} color={String(color)} strokeWidth={focused ? 2 : 1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="marche"
        options={{
          title: 'Marché',
          tabBarIcon: ({ color, focused }) => (
            <MarketTabIcon color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ventes"
        options={{
          title: 'Ventes',
          tabBarIcon: ({ color, focused }) => (
            <VentesTabIcon color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="carte"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color, focused }) => (
            <Icon name="map" size={24} color={String(color)} strokeWidth={focused ? 2 : 1.6} />
          ),
        }}
      />
    </Tabs>
  );
}

function VentesTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const hasNew = useVentesStore((s) => s.hasNewOrders);
  return (
    <View>
      <Icon name="store" size={24} color={color} strokeWidth={focused ? 2 : 1.6} />
      {hasNew && (
        <View style={styles.newDotRed} />
      )}
    </View>
  );
}

function MarketTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const totalItems = useCartStore((s) => s.totalItems());
  const hasNewProducts = useMarketStore((s) => s.hasNewProducts);
  const hasOrderUpdate = useMarketStore((s) => s.hasOrderUpdate);

  // Priorité : rouge (commande validée/refusée) > vert (nouveaux produits)
  const showRedDot  = hasOrderUpdate;
  const showGreenDot = hasNewProducts && !hasOrderUpdate && totalItems === 0;

  return (
    <View>
      <Icon name="cart" size={24} color={color} strokeWidth={focused ? 2 : 1.6} />

      {/* Badge panier (nombre d'articles) */}
      {totalItems > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{Math.floor(totalItems / 10)}</Text>
        </View>
      )}

      {/* Point rouge — commande acheteur validée ou refusée */}
      {showRedDot && <View style={[styles.notifDot, { backgroundColor: '#EF4444' }]} />}

      {/* Point vert — nouveaux produits publiés par d'autres */}
      {showGreenDot && <View style={[styles.notifDot, { backgroundColor: Colors.ok }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tabLabel: { fontSize: 11, fontWeight: '600' },

  cartBadge: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.clay,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },

  /* Point de notification générique (couleur via style inline) */
  notifDot: {
    position: 'absolute', top: -3, right: -4,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 1.5, borderColor: Colors.bgCard,
  },

  /* Point rouge — nouvelle commande reçue (onglet Ventes) */
  newDotRed: {
    position: 'absolute', top: -3, right: -4,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5, borderColor: Colors.bgCard,
  },
});
