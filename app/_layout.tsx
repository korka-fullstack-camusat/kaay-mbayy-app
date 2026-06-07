import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '@/store/authStore';
import { authApi, wakeUpBackend } from '@/services/api';

/* Réveiller le serveur Render dès le chargement du module — avant même
   le premier rendu — pour gagner un maximum de temps sur le "cold start". */
wakeUpBackend();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
});

/* Configuration globale : afficher les notifications même en premier plan */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null; // simulateur → pas de token réel

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Expo gère automatiquement via app.json / EAS
    });
    return tokenData.data;
  } catch {
    return null;
  }
}

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const token = useAuthStore((s) => s.token);
  const notifListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    loadFromStorage();
  }, []);

  /* Enregistrer le push token dès que l'utilisateur est connecté */
  useEffect(() => {
    if (!token) return;

    registerForPushNotifications().then((pushToken) => {
      if (pushToken) {
        authApi.savePushToken(pushToken).catch(() => {
          /* Silencieux — non bloquant */
        });
      }
    });

    /* Écouter les notifications reçues en premier plan */
    notifListener.current = Notifications.addNotificationReceivedListener((_notif) => {
      // La notification est déjà affichée par setNotificationHandler
    });

    /* Réagir au tap sur une notification */
    responseListener.current = Notifications.addNotificationResponseReceivedListener((_response) => {
      // Pourra naviguer vers l'écran Ventes dans une future version
    });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [token]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
