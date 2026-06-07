import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator,
  Alert, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/Icon';
import { AppHeader } from '@/components/AppHeader';
import { AlertsModal } from '@/components/AlertsModal';
import { ProfileModal } from '@/components/ProfileModal';
import { useAuthStore } from '@/store/authStore';
import { weatherApi, diagnosesApi, parcelsApi } from '@/services/api';

type ChatMsg =
  | { type: 'user-photo' }
  | { type: 'user-text'; text: string }
  | { type: 'analyzing' }
  | { type: 'diagnosis'; disease: string; wolof: string; confidence: number; steps: { t: string; s: string }[] }
  | { type: 'tip'; text: string }
  | { type: 'not-plant' };

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');

  const { data: weather } = useQuery({
    queryKey: ['weather', user?.location],
    queryFn: () => weatherApi.get(user?.location || 'Kaolack').then((r) => r.data),
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: parcelsData } = useQuery({
    queryKey: ['parcels'],
    queryFn: () => parcelsApi.list().then((r) => r.data),
    enabled: !!user,
  });

  const parcels: any[] = parcelsData || [];
  const goodParcels = parcels.filter((p) => p.status === 'bon').length;

  const chatScrollRef = useRef<ScrollView>(null);

  /* Auto-scroll vers le bas à chaque nouveau message */
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

  const { data: diagsData } = useQuery({
    queryKey: ['diagnoses'],
    queryFn: () => diagnosesApi.list().then((r) => r.data),
    enabled: !!user,
  });
  const diagCount = (diagsData as any[])?.length || 0;

  const pickAndAnalyze = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorisez l'accès à la caméra dans les réglages de l'application."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: false,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setMessages((prev) => [...prev, { type: 'user-photo' }, { type: 'analyzing' }]);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'plant.jpg',
      } as any);
      formData.append('crop_hint', 'arachide');

      const res = await diagnosesApi.create(formData);
      const d = res.data;

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          type: 'diagnosis',
          disease: d.disease,
          wolof: d.wolof_name || '',
          confidence: d.confidence,
          steps: (d.treatment_steps || []).map((s: any) => ({ t: s.title, s: s.subtitle })),
        },
      ]);
    } catch (_) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { type: 'not-plant' },
      ]);
    }
  };

  const sendText = useCallback(async () => {
    if (!inputText.trim()) return;
    const q = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { type: 'user-text', text: q }, { type: 'analyzing' }]);

    await new Promise((r) => setTimeout(r, 1400));
    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        type: 'tip',
        text: 'Pour un diagnostic précis, prends une photo de ta plante avec le bouton caméra. Je peux aussi répondre à tes questions sur les cultures et les traitements.',
      },
    ]);
  }, [inputText]);

  /* Widgets — réutilisés dans les deux modes */
  const widgetsRow = (
    <View style={styles.widgetsRow}>
      <View style={styles.widget}>
        <View style={styles.widgetTopRow}>
          <Icon name="sun" size={22} color={Colors.warn} strokeWidth={1.5} />
          <Text style={styles.widgetLabel}>{weather?.location || 'Kaolack'}</Text>
        </View>
        <Text style={styles.widgetBig}>{weather?.temp_celsius || 31}°</Text>
        <Text style={styles.widgetSub}>
          {weather?.condition || 'Ensoleillé'}{'\n'}{weather?.humidity_pct || 68}% humidité
        </Text>
      </View>

      <View style={styles.widget}>
        <View style={styles.widgetTopRow}>
          <Icon name="leaf" size={22} color={Colors.green} strokeWidth={1.5} />
          <View style={styles.pillGreen}>
            <Icon name="check" size={10} color={Colors.ok} strokeWidth={2.5} />
            <Text style={styles.pillText}>Bon</Text>
          </View>
        </View>
        <Text style={styles.widgetBig}>
          {goodParcels}
          <Text style={styles.widgetBigSub}> / {parcels.length}</Text>
        </Text>
        <Text style={styles.widgetSub}>Parcelles{'\n'}en bon état</Text>
      </View>
    </View>
  );

  /* En-tête de l'agent — réutilisé dans les deux modes */
  const agentHeader = (
    <>
      <View style={styles.agentTopRow}>
        <View style={styles.onlineDot} />
        <Text style={styles.agentLabel}>DiagnoAgrI · en ligne</Text>
      </View>
      <Text style={styles.agentTitle}>Diagnostic de cultures</Text>
    </>
  );

  /* Barre de composition */
  const composer = (
    <View style={styles.composer}>
      <TouchableOpacity onPress={pickAndAnalyze} style={styles.camBtn}>
        <Icon name="camera" size={16} color={Colors.white} />
      </TouchableOpacity>
      <TextInput
        value={inputText}
        onChangeText={setInputText}
        onSubmitEditing={sendText}
        placeholder="Décris ta plante…"
        style={styles.composerInput}
        placeholderTextColor={Colors.inkMute}
      />
      <TouchableOpacity
        onPress={sendText}
        disabled={!inputText.trim()}
        style={[styles.sendBtn, !inputText.trim() && styles.sendDisabled]}
      >
        <Icon name="arrow-up" size={16} color={inputText.trim() ? Colors.white : Colors.inkMute} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        user={user}
        onBellPress={() => setAlertsOpen(true)}
        onAvatarPress={() => setProfileOpen(true)}
      />

      {messages.length === 0 ? (
        /* ── Mode vide : layout scrollable normal ── */
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {widgetsRow}
          <View style={styles.agentSection}>
            {agentHeader}
            <View style={styles.chatBox}>
              <AgentEmpty onPhoto={pickAndAnalyze} />
            </View>
          </View>
        </ScrollView>
      ) : (
        /* ── Mode chat : le chat prend toute la place restante ── */
        <View style={styles.chatScreen}>
          {widgetsRow}
          <View style={styles.agentSectionFull}>
            {agentHeader}
            <View style={styles.chatBoxFull}>
              <ScrollView
                ref={chatScrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 10, padding: 10 }}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((m, i) => (
                  <ChatBubble key={i} msg={m} />
                ))}
              </ScrollView>
              {composer}
            </View>
          </View>
        </View>
      )}

      <AlertsModal visible={alertsOpen} onClose={() => setAlertsOpen(false)} />
      <ProfileModal
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onLogout={logout}
        diagnosisCount={diagCount}
        parcelCount={parcels.length}
      />
    </SafeAreaView>
  );
}

function AgentEmpty({ onPhoto }: { onPhoto: () => void }) {
  return (
    <View style={styles.agentEmpty}>
      <View style={styles.sparkleBox}>
        <Icon name="sparkle" size={28} color={Colors.clay} strokeWidth={1.5} />
      </View>
      <Text style={styles.agentEmptyTitle}>Comment puis-je t'aider ?</Text>
      <Text style={styles.agentEmptySub}>
        Prends une photo de ta plante pour un diagnostic instantané.
      </Text>
      <TouchableOpacity onPress={onPhoto} style={styles.photoBtn}>
        <Icon name="camera" size={18} color={Colors.white} strokeWidth={1.8} />
        <Text style={styles.photoBtnText}>Photographier</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  if (msg.type === 'user-photo') {
    return (
      <View style={styles.bubbleRight}>
        <View style={styles.photoBubble}>
          <View style={styles.photoThumb} />
          <View>
            <Text style={styles.photoBubbleTitle}>Photo envoyée</Text>
            <Text style={styles.photoBubbleSub}>Plant d'arachide</Text>
          </View>
        </View>
      </View>
    );
  }
  if (msg.type === 'user-text') {
    return (
      <View style={styles.bubbleRight}>
        <View style={styles.textBubble}>
          <Text style={styles.textBubbleText}>{msg.text}</Text>
        </View>
      </View>
    );
  }
  if (msg.type === 'analyzing') {
    return (
      <View style={styles.bubbleLeft}>
        <AgentAvatar />
        <View style={styles.analyzingBubble}>
          <ActivityIndicator size="small" color={Colors.inkMute} />
          <Text style={styles.analyzingText}>Analyse en cours…</Text>
        </View>
      </View>
    );
  }
  if (msg.type === 'not-plant') {
    return (
      <View style={styles.bubbleLeft}>
        <AgentAvatar />
        <View style={styles.notPlantBubble}>
          <Text style={styles.notPlantText}>
            🌿 L'image que vous avez partagée n'appartient pas à une plante. Veuillez envoyer une image d'une plante ou d'un arbre.
          </Text>
        </View>
      </View>
    );
  }
  if (msg.type === 'tip') {
    return (
      <View style={styles.bubbleLeft}>
        <AgentAvatar />
        <View style={styles.tipBubble}>
          <Text style={styles.tipText}>{msg.text}</Text>
        </View>
      </View>
    );
  }
  if (msg.type === 'diagnosis') {
    return (
      <View style={styles.bubbleLeft}>
        <AgentAvatar />
        <View style={styles.diagBubble}>
          <View style={styles.diagConfidenceRow}>
            <Icon name="check" size={12} color={Colors.ok} strokeWidth={2.5} />
            <Text style={styles.diagConfidence}>Diagnostic · {msg.confidence}% confiance</Text>
          </View>
          <Text style={styles.diagDisease}>{msg.disease}</Text>
          <Text style={styles.diagWolof}>"{msg.wolof}"</Text>
          <View style={styles.diagStepsDivider} />
          <Text style={styles.diagStepsLabel}>Plan d'action</Text>
          {msg.steps.map((s, i) => (
            <View key={i} style={styles.diagStep}>
              <View style={styles.diagStepNum}>
                <Text style={styles.diagStepNumText}>{i + 1}</Text>
              </View>
              <View>
                <Text style={styles.diagStepTitle}>{s.t}</Text>
                <Text style={styles.diagStepSub}>{s.s}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }
  return null;
}

function AgentAvatar() {
  return (
    <View style={styles.agentAvatarBox}>
      <Icon name="leaf" size={16} color="#F6C982" strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCream },
  scroll: { paddingBottom: 24 },
  widgetsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 2 },
  widget: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.line, padding: 14,
    alignItems: 'center',
  },
  widgetTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  widgetLabel: { fontSize: 11, fontWeight: '600', color: Colors.inkMute },
  widgetBig: { fontSize: 28, fontWeight: '800', color: Colors.ink, marginTop: 8, textAlign: 'center' },
  widgetBigSub: { fontSize: 14, color: Colors.inkMute, fontWeight: '500' },
  widgetSub: { fontSize: 12, color: Colors.inkSoft, marginTop: 4, textAlign: 'center', lineHeight: 17 },
  pillGreen: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.greenSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50,
  },
  pillText: { fontSize: 10, fontWeight: '700', color: Colors.ok },
  agentSection: { padding: 20, paddingTop: 18 },
  agentTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  agentLabel: { fontSize: 11, fontWeight: '700', color: Colors.inkMute, textTransform: 'uppercase', letterSpacing: 0.5 },
  agentTitle: { fontSize: 22, fontWeight: '800', color: Colors.ink, marginTop: 4 },
  chatBox: {
    marginTop: 12, backgroundColor: Colors.bgCard,
    borderRadius: 22, borderWidth: 1, borderColor: Colors.line,
    minHeight: 280, padding: 12, overflow: 'hidden',
  },
  agentEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 10, minHeight: 240 },
  sparkleBox: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: Colors.claySoft, alignItems: 'center', justifyContent: 'center',
  },
  agentEmptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.ink },
  agentEmptySub: { fontSize: 13, color: Colors.inkMute, textAlign: 'center', lineHeight: 18 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 50, paddingHorizontal: 22, borderRadius: 50,
    backgroundColor: Colors.clay,
  },
  photoBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  composer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 6, marginTop: 8, backgroundColor: Colors.bgMuted, borderRadius: 50,
  },
  camBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.clay, alignItems: 'center', justifyContent: 'center',
  },
  composerInput: { flex: 1, height: 36, fontSize: 14, color: Colors.ink },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: 'transparent' },
  bubbleRight: { alignItems: 'flex-end', paddingLeft: 40 },
  bubbleLeft: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingRight: 24 },
  photoBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.clay, padding: 10, borderRadius: 18, borderBottomRightRadius: 4,
  },
  photoThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#2A4A30' },
  photoBubbleTitle: { fontSize: 13, fontWeight: '700', color: Colors.white },
  photoBubbleSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  textBubble: {
    backgroundColor: Colors.clay, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomRightRadius: 4, maxWidth: '85%',
  },
  textBubbleText: { fontSize: 14, color: Colors.white, lineHeight: 20 },
  analyzingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgMuted, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4,
  },
  analyzingText: { fontSize: 13, color: Colors.inkSoft },
  tipBubble: {
    backgroundColor: Colors.bgMuted, padding: 12, borderRadius: 18,
    borderBottomLeftRadius: 4, flex: 1,
  },
  tipText: { fontSize: 14, color: Colors.ink, lineHeight: 20 },
  notPlantBubble: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    padding: 14, borderRadius: 18, borderBottomLeftRadius: 4, flex: 1,
  },
  notPlantText: { fontSize: 14, color: '#7F1D1D', lineHeight: 21 },
  diagBubble: {
    backgroundColor: Colors.bgMuted, padding: 14, borderRadius: 18,
    borderBottomLeftRadius: 4, flex: 1,
  },
  diagConfidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  diagConfidence: { fontSize: 11, fontWeight: '600', color: Colors.ok },
  diagDisease: { fontSize: 18, fontWeight: '800', color: Colors.ink, marginTop: 6 },
  diagWolof: { fontSize: 12, fontStyle: 'italic', color: Colors.inkSoft, marginTop: 2 },
  diagStepsDivider: { height: 1, backgroundColor: Colors.line, marginVertical: 10, borderStyle: 'dashed' },
  diagStepsLabel: { fontSize: 10, fontWeight: '700', color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 8 },
  diagStep: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  diagStepNum: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.green,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  diagStepNumText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  diagStepTitle: { fontSize: 13, fontWeight: '600', color: Colors.ink },
  diagStepSub: { fontSize: 11, color: Colors.inkMute },
  agentAvatarBox: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.greenDeep,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  /* ── Mode chat plein-écran ── */
  chatScreen: {
    flex: 1,
    paddingBottom: 8,
  },
  agentSectionFull: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  chatBoxFull: {
    flex: 1,
    marginTop: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
    padding: 8,
  },
});
