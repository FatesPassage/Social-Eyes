import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '@/components/BrandHeader';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { theme } from '@/constants/theme';

export default function EyesScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="Your connections" />
      <View style={{ paddingTop: 17, gap: 8 }}>
        <Text style={styles.title}>Mutual Eyes.</Text>
        <Text style={styles.subtitle}>A connection appears only when you and someone at the same participating venue choose each other.</Text>
      </View>
      <View style={styles.emptyCard}>
        <View style={styles.eye}><Ionicons name="eye-outline" size={30} color={theme.colors.cyan} /></View>
        <Text style={styles.heading}>No mutual Eyes yet</Text>
        <Text style={styles.copy}>You won't see strangers or one-sided interest here. When both people choose each other, a private connection can appear.</Text>
      </View>
      <Panel><Text style={styles.panelTitle}>No one gets notified about a one-sided Eye.</Text><Text style={styles.copy}>Your interest stays private unless the other person chooses you too.</Text></Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1.15 },
  subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
  emptyCard: { minHeight: 252, justifyContent: 'center', alignItems: 'center', padding: 24, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 25, backgroundColor: theme.colors.surface, gap: 12 },
  eye: { width: 66, height: 66, borderRadius: 22, backgroundColor: '#173246', alignItems: 'center', justifyContent: 'center' },
  heading: { color: theme.colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  copy: { color: theme.colors.muted, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  panelTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '800' },
});
