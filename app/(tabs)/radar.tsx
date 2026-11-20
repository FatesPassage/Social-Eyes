import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '@/components/BrandHeader';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { theme } from '@/constants/theme';

export default function RadarScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="Your presence" />
      <View style={styles.intro}>
        <Text style={styles.kicker}>YOU CONTROL YOUR VISIBILITY</Text>
        <Text style={styles.title}>Check in. Connect.</Text>
        <Text style={styles.subtitle}>Only people who choose to check in at the same participating venue will be discoverable.</Text>
      </View>
      <View style={styles.hero} accessibilityRole="summary">
        <View style={styles.icon}><Ionicons name="location-outline" size={32} color={theme.colors.cyan} /></View>
        <Text style={styles.heading}>You're not checked in</Text>
        <Text style={styles.body}>You're invisible to other visitors. Live venue check-in isn't connected yet, so we won't pretend you're visible or show fictional people.</Text>
        <View style={styles.status}><Ionicons name="lock-closed-outline" size={14} color={theme.colors.cyan} /><Text style={styles.statusText}>Presence off by default</Text></View>
      </View>
      <Panel>
        <Text style={styles.panelTitle}>How check-in will work</Text>
        <Text style={styles.body}>Choose a participating venue, explicitly check in, and leave at any time. Sessions expire automatically. No background location tracking or exact GPS coordinates will be shown.</Text>
      </Panel>
    </Screen>
  );
}
const styles = StyleSheet.create({
  intro: { gap: 9, paddingTop: 15, paddingBottom: 8 },
  kicker: { color: theme.colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: theme.colors.text, fontSize: 34, lineHeight: 40, fontWeight: '900', letterSpacing: -1.4 },
  subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
  hero: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 24, backgroundColor: theme.colors.surface, padding: 28, minHeight: 270, justifyContent: 'center', alignItems: 'center', gap: 13 },
  icon: { width: 74, height: 74, borderRadius: 24, backgroundColor: '#123344', alignItems: 'center', justifyContent: 'center' },
  heading: { color: theme.colors.text, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  body: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 13, borderRadius: 24, backgroundColor: '#122F38' },
  statusText: { color: theme.colors.cyan, fontSize: 11, fontWeight: '800' },
  panelTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '800' },
});
