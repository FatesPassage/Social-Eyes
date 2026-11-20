import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { markWelcomeComplete } from '@/lib/preferences';

export default function WelcomeScreen() {
  const { height, width } = useWindowDimensions();
  const compact = height < 720;
  const narrow = width < 360;
  const landscape = width > height;
  const submissionInProgress = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const continueToApp = async () => {
    if (submissionInProgress.current) return;
    submissionInProgress.current = true;
    setSaving(true);
    setError(null);
    try {
      await markWelcomeComplete();
      router.replace('/(tabs)');
    } catch {
      setError('We could not save your welcome progress. Please try again.');
    } finally {
      submissionInProgress.current = false;
      setSaving(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.scroll, compact && styles.scrollCompact, landscape && styles.scrollLandscape]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={[styles.orb, compact && styles.orbCompact, landscape && styles.orbLandscape]} accessible={false}><Image source={require('../assets/images/social-eyes-mark.png')} style={[styles.welcomeMark, compact && styles.welcomeMarkCompact, landscape && styles.welcomeMarkLandscape]} accessibilityLabel="Social Eyes eye logo" accessibilityRole="image" /></View>
      <View style={[styles.content, narrow && styles.contentNarrow, landscape && styles.contentLandscape]}>
        <Text style={styles.brand}>Social <Text style={{ color: theme.colors.cyan }}>Eyes</Text></Text>
        <Text style={styles.kicker}>SEE BEFORE YOU GO</Text>
        <Text style={[styles.title, narrow && styles.titleNarrow]}>The social layer{'\n'}over real life.</Text>
        <Text style={styles.copy}>Discover who's out, get a feel for the room, and make a connection before you cross it.</Text>
        <View style={styles.trustRow} accessibilityRole="text" accessible accessibilityLabel="Private by design. Venue presence is opt in. Connections require mutual interest."><Text style={styles.trustText}>◉  Opt-in presence</Text><Text style={styles.trustText}>♡  Mutual connections</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Explore Social Eyes" accessibilityHint="Opens the discovery experience" accessibilityState={{ disabled: saving, busy: saving }} disabled={saving} onPress={() => { void continueToApp(); }} style={[styles.button, saving && styles.disabled]}>
          {saving ? <ActivityIndicator color="#06111B" /> : <Text style={styles.buttonText}>Explore Social Eyes  →</Text>}
        </Pressable>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Text style={styles.note}>A new way to connect in the real world.</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 26, paddingBottom: 24 },
  scrollCompact: { paddingTop: 12 },
  scrollLandscape: { paddingTop: 8, paddingBottom: 12 },
  orbLandscape: { width: 96, height: 96, borderRadius: 48, marginVertical: 4 },
  welcomeMarkLandscape: { width: 90, height: 90, borderRadius: 22 },
  contentLandscape: { gap: 6, paddingBottom: 6 },
  orbCompact: { width: 168, height: 168, borderRadius: 84, marginVertical: 8 },
  contentNarrow: { gap: 8 },
  titleNarrow: { fontSize: 35, lineHeight: 40 },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 9, alignItems: 'center' },
  trustText: { color: theme.colors.text, backgroundColor: '#122A36', fontSize: 11, fontWeight: '700', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7, overflow: 'hidden' },
  orb: { alignSelf: 'center', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: '#2B5D73', alignItems: 'center', justifyContent: 'center', marginVertical: 24, shadowColor: theme.colors.cyan, shadowOpacity: 0.22, shadowRadius: 55 },
  welcomeMark: { width: 210, height: 210, borderRadius: 46 },
  welcomeMarkCompact: { width: 160, height: 160, borderRadius: 36 },
  orbInner: { width: 155, height: 155, borderRadius: 78, borderWidth: 1, borderColor: '#3C3567', alignItems: 'center', justifyContent: 'center' },
  orbCore: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: '#70476E', backgroundColor: '#10182A' },
  content: { gap: 12, paddingBottom: 20 },
  brand: { color: theme.colors.text, fontSize: 43, fontWeight: '900', letterSpacing: -1.9, lineHeight: 49 },
  kicker: { color: theme.colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 2.5, marginTop: 7, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 43, lineHeight: 47, letterSpacing: -1.8, fontWeight: '900' },
  copy: { color: theme.colors.muted, fontSize: 14, lineHeight: 23, letterSpacing: 0.1, marginBottom: 12 },
  button: { backgroundColor: theme.colors.cyan, borderRadius: 18, minHeight: 52, paddingHorizontal: 16, paddingVertical: 17, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.cyan, shadowOpacity: 0.2, shadowRadius: 16, elevation: 3 },
  disabled: { opacity: 0.7 },
  buttonText: { color: '#06111B', fontWeight: '900', fontSize: 14, letterSpacing: 0.35 },
  error: { color: '#FFB6C2', fontSize: 13, lineHeight: 19, textAlign: 'center', paddingVertical: 4 },
  note: { color: theme.colors.muted, fontSize: 11, lineHeight: 18, textAlign: 'center', marginTop: 8, letterSpacing: 0.3 },
});
