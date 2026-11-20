import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { Screen } from '@/components/Screen';
import { AccountPanel } from '@/components/AccountPanel';
import { ActivityIndicator, Text } from 'react-native';

const icons = {
  index: ['compass-outline', 'compass'],
  radar: ['location-outline', 'location'],
  eyes: ['eye-outline', 'eye'],
  profile: ['person-circle-outline', 'person-circle'],
} as const;

export default function TabLayout() {
  const { recoverySession, recoveryLinkChecking } = useAuth();
  // Do not briefly expose authenticated tabs while a recovery link is resolving.
  if (recoveryLinkChecking) return <Screen><ActivityIndicator color={theme.colors.cyan} accessibilityLabel="Verifying account link" /></Screen>;
  // A recovery token creates a temporary authenticated session. Do not expose
  // the normal tab navigator until recovery has been completed or cancelled.
  if (recoverySession) {
    return <Screen>
      <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800', marginBottom: 12 }}>Secure account recovery</Text>
      <AccountPanel />
    </Screen>;
  }
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: theme.colors.cyan,
      tabBarInactiveTintColor: theme.colors.faint,
      tabBarStyle: {
        backgroundColor: '#090E19',
        borderTopColor: theme.colors.border,
        height: 78,
        paddingTop: 9,
        paddingBottom: 12,
      },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
      tabBarIcon: ({ focused, color, size }) => {
        const pair = icons[route.name as keyof typeof icons] ?? icons.index;
        return <Ionicons name={(focused ? pair[1] : pair[0]) as keyof typeof Ionicons.glyphMap} size={size + 1} color={color} />;
      },
    })}>
      <Tabs.Screen name="index" options={{ title: 'Discover' }} />
      <Tabs.Screen name="radar" options={{ title: 'Check in' }} />
      <Tabs.Screen name="eyes" options={{ title: 'Eyes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Me' }} />
    </Tabs>
  );
}
