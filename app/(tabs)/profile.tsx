import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '@/components/BrandHeader';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { theme } from '@/constants/theme';
import { useApp } from '@/providers/AppProvider';
import { AccountPanel } from '@/components/AccountPanel';

export default function ProfileScreen() {
  const { settings, settingsReady, settingsStorageAvailable, settingsSaving, settingsError, updateSettings, retrySettings, backendStatus, refreshBackend } = useApp();
  return (
    <Screen>
      <BrandHeader eyebrow="Your presence" />
      <View style={styles.profile}>
        <View style={styles.avatar}><Ionicons name="person" size={42} color={theme.colors.cyan} /></View>
        <Text style={styles.name}>Your profile</Text>
        <Text style={styles.copy}>Your profile details are private by default. Venue visibility requires a separate, explicit check-in.</Text>
      </View>
      <AccountPanel />
      <Panel>
        <Text style={styles.title}>Privacy preferences</Text>
        {settingsSaving ? <Text accessibilityLiveRegion="polite" style={styles.copy}>Saving preferences…</Text> : null}
        {!settingsReady ? <ActivityIndicator color={theme.colors.cyan} /> : <>
          <Setting disabled={settingsSaving || !settingsStorageAvailable} label="Incognito" detail="Default on. Live presence will require a separate explicit venue check-in." value={settings.incognito} onChange={value => void updateSettings({ incognito: value })} />
          <View style={styles.rule} />
          <Setting disabled={settingsSaving || !settingsStorageAvailable} label="Show intentions" detail="Allow your selected social intentions to appear when you opt in." value={settings.showIntentions} onChange={value => void updateSettings({ showIntentions: value })} />
          <View style={styles.rule} />
          <Setting disabled={settingsSaving || !settingsStorageAvailable} label="Notification preference" detail="Saves your preference only. Push notifications are not connected yet." value={settings.allowNotifications} onChange={value => void updateSettings({ allowNotifications: value })} />
        </>}
        {!settingsStorageAvailable && settingsReady ? <Text accessibilityLiveRegion="polite" style={styles.error}>Preferences are locked until device storage can be read. Displayed defaults do not change any existing venue presence. Retry loading to restore editing.</Text> : null}
        {settingsError ? <><Text accessibilityRole="alert" style={styles.error}>{settingsError}</Text><Pressable disabled={settingsSaving} accessibilityRole="button" accessibilityLabel="Reload saved privacy preferences" onPress={() => void retrySettings()}><Text style={styles.action}>Reload saved preferences</Text></Pressable></> : null}
      </Panel>
      <Panel>
        <Text style={styles.title}>Service connection</Text>
        <Text style={styles.copy}>{backendStatus === 'unconfigured' ? 'Backend not configured. Live features remain unavailable.' : backendStatus === 'checking' ? 'Checking backend reachability…' : backendStatus === 'reachable' ? 'Authentication endpoint reachable. Account sign-in, database permissions, and profile persistence still require live verification.' : backendStatus === 'paused' ? 'Connection status paused while the app is inactive. It will refresh when you return.' : 'Backend unreachable. Check your connection or project configuration.'}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Check service connection again" disabled={backendStatus === 'checking' || backendStatus === 'paused'} accessibilityState={{ disabled: backendStatus === 'checking' || backendStatus === 'paused' }} onPress={() => void refreshBackend()} style={styles.button}><Text style={styles.buttonText}>Check connection again</Text></Pressable>
      </Panel>
      <Panel><Text style={styles.title}>Your control matters</Text><Text style={styles.copy}>Your preferences are stored on this device. They do not publish your location or create a live check-in.</Text></Panel>
    </Screen>
  );
}

function Setting({ label, detail, value, disabled, onChange }: { label: string; detail: string; value: boolean; disabled: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.row}><View style={{ flex: 1, gap: 5 }}><Text style={styles.rowTitle}>{label}</Text><Text style={styles.copy}>{detail}</Text></View><Switch accessibilityLabel={label} accessibilityRole="switch" accessibilityState={{ disabled, checked: value }} disabled={disabled} value={value} onValueChange={onChange} trackColor={{ true: theme.colors.violet }} thumbColor={theme.colors.text} /></View>;
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  avatar: { width: 92, height: 92, borderRadius: 30, borderWidth: 1, borderColor: '#426C89', backgroundColor: '#163046', alignItems: 'center', justifyContent: 'center' },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  rowTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '800' },
  copy: { color: theme.colors.muted, fontSize: 12, lineHeight: 19, textAlign: 'left' },
  rule: { height: 1, backgroundColor: theme.colors.border },
  title: { color: theme.colors.text, fontSize: 15, fontWeight: '800', marginBottom: 8 },
  error: { color: theme.colors.danger, fontSize: 12, marginTop: 10 },
  action: { color: theme.colors.cyan, fontSize: 13, marginTop: 8 },
  button: { alignSelf: 'flex-start', borderRadius: 12, backgroundColor: theme.colors.surfaceRaised, paddingHorizontal: 15, paddingVertical: 12, marginTop: 12 },
  buttonText: { color: theme.colors.cyan, fontWeight: '700', fontSize: 12 },
});
