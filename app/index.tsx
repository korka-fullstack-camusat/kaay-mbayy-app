import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const { token, isLoaded } = useAuthStore();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgCream }}>
        <ActivityIndicator color={Colors.green} />
      </View>
    );
  }

  return <Redirect href={token ? '/(tabs)' : '/(auth)'} />;
}
