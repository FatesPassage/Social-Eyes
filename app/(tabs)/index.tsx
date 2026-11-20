import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '@/components/BrandHeader';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { theme } from '@/constants/theme';
import { isBackendConfigured } from '@/lib/supabase';

export default function DiscoverScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="Discover venues" />
      <View style={styles.hero}>
        <Text style={styles.kicker}>DISCOVER REAL PLACES</Text>
        <Text style={styles.title}>Find your{ '\n' }people.</Text>
        <Text style={styles.subtitle}>Explore participating venues. Choose when to check in and meet people who opted in too.</Text>
      </View>
      <View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>{isBackendConfigured ? 'Backend credentials configured · live connection not yet verified' : 'Development preview · backend not connected'}</Text></View>
      <Panel>
        <View style={styles.panelTop}>
          <View style={styles.iconCircle}><Ionicons name="map-outline" size={21} color={theme.colors.cyan} /></View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.panelTitle}>Participating venues</Text>
            <Text style={styles.body}>Venue listings aren't connected yet.</Text>
          </View>
          <Text style={styles.soon}>NEXT</Text>
        </View>
        <Text style={styles.body}>Real venue listings will appear here once venue data is connected and verified. We never invent venues, attendees or crowd counts.</Text>
      </Panel>
      <Panel>
        <Text style={styles.panelTitle}>How Social Eyes works</Text>
        <Feature icon="location-outline" title="Choose a venue" description="Discover places and events worth going to." />
        <Feature icon="radio-outline" title="Opt into presence" description="Check in when you want others to see you." />
        <Feature icon="eye-outline" title="Make a mutual connection" description="Interest stays private unless it's returned." />
      </Panel>
    </Screen>
  );
}

function Feature({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }) {
  return <View style={styles.feature}><Ionicons name={icon} size={20} color={theme.colors.violet} /><View style={{ flex: 1, gap: 2 }}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.body}>{description}</Text></View></View>;
}

const styles = StyleSheet.create({
  hero: { paddingTop: 16, paddingBottom: 8, gap: 10 },
  kicker: { color: theme.colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: theme.colors.text, fontSize: 42, lineHeight: 47, letterSpacing: -1.9, fontWeight: '900' },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, maxWidth: 340 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.gold },
  statusText: { color: theme.colors.muted, fontSize: 11, fontWeight: '700' },
  panelTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#153447', alignItems: 'center', justifyContent: 'center' },
  panelTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800' },
  body: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  soon: { color: theme.colors.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  feature: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingTop: 7 },
  featureTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
});
