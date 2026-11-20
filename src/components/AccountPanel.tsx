import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Panel } from '@/components/Panel';
import { theme } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { getMyProfile, saveMyProfile, type SocialIntent } from '@/lib/profiles';
import { isBackendConfigured } from '@/lib/supabase';
import { validateAuthInput, validateRecoveryEmail } from '@/lib/authInput';
import { hasProfileChanges, savedProfileSnapshot, type ProfileDraft } from '@/lib/profileDraft';
import { validateProfileDraft } from '@/lib/profileValidation';
import { validatePasswordConfirmation } from '@/lib/passwordConfirmation';
const intents: SocialIntent[] = ['friends', 'dating', 'events', 'casual'];
export function AccountPanel() {
  const { session, loading, error, clearError, signIn, signUp, signOut, requestPasswordReset, resendConfirmation, recoverySession, updateRecoveryPassword, cancelRecovery } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const requestInFlight = useRef(false);
  const accountGeneration = useRef(0);
  const [message, setMessage] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<string | null>(null);
  const [confirmationCooldownUntil, setConfirmationCooldownUntil] = useState(0);
  const [confirmationClock, setConfirmationClock] = useState(0);
  useEffect(() => {
    if (!awaitingConfirmation || !confirmationCooldownUntil || Date.now() >= confirmationCooldownUntil) return;
    const timer = setTimeout(() => setConfirmationClock(value => value + 1), Math.max(0, confirmationCooldownUntil - Date.now()));
    return () => clearTimeout(timer);
  }, [awaitingConfirmation, confirmationCooldownUntil, confirmationClock]);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [intent, setIntent] = useState<SocialIntent>('friends');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [profileReload, setProfileReload] = useState(0);
  const [savedProfile, setSavedProfile] = useState<ProfileDraft | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const dirty = hasProfileChanges({ display_name: displayName, bio, intent }, savedProfile);
  useEffect(() => {
    let active = true;
    accountGeneration.current += 1;
    setBusy(false); requestInFlight.current = false;
    setPassword(''); setNewPassword(''); setConfirmPassword('');
    setMessage(null); setProfileError(false);
    setAwaitingConfirmation(null); setConfirmationCooldownUntil(0);
    setDisplayName(''); setBio(''); setIntent('friends'); setSavedProfile(null); setProfileExists(false);
    if (!session || recoverySession) { setProfileLoading(false); return () => { active = false; }; }
    setProfileLoading(true);
    getMyProfile(session.user.id).then(profile => {
      if (active && profile) { setDisplayName(profile.display_name); setBio(profile.bio); setIntent(profile.intent); setSavedProfile({ display_name: profile.display_name, bio: profile.bio, intent: profile.intent }); setProfileExists(true); }
    }).catch(() => { if (active) { setProfileError(true); setMessage('Profile unavailable. Retry loading before editing.'); } })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [session?.user.id, recoverySession, profileReload]);
  const submit = async () => {
    if (requestInFlight.current) return;
    const input = validateAuthInput(email, password, mode);
    if (!input.ok) { setMessage(input.message); return; }
    requestInFlight.current = true;
    const generation = accountGeneration.current;
    setBusy(true); setMessage(null); clearError();
    try {
      if (mode === 'sign-in') await signIn(input.email, input.password);
      else {
        const result = await signUp(input.email, input.password);
        if (result === 'confirm-email' && generation === accountGeneration.current) { setAwaitingConfirmation(input.email); setConfirmationCooldownUntil(Date.now() + 60000); setMessage('Check your email to confirm your account before signing in.'); }
      }
    } catch { if (generation === accountGeneration.current) setMessage('Could not contact the authentication service.'); }
    finally { if (generation === accountGeneration.current) { setPassword(''); setBusy(false); requestInFlight.current = false; } }
  };
  const resendSignupConfirmation = async () => {
    if (requestInFlight.current || busy || !awaitingConfirmation || Date.now() < confirmationCooldownUntil) return;
    const generation = accountGeneration.current;
    requestInFlight.current = true;
    setBusy(true); setMessage(null); clearError();
    try {
      const sent = await resendConfirmation(awaitingConfirmation);
      if (generation === accountGeneration.current && sent) {
        setConfirmationCooldownUntil(Date.now() + 60000);
        setMessage('If confirmation is still needed, another email will arrive shortly.');
      }
    } catch { if (generation === accountGeneration.current) setMessage('Unable to resend confirmation right now.'); }
    finally { if (generation === accountGeneration.current) { requestInFlight.current = false; setBusy(false); } }
  };
  const recoverPassword = async () => {
    if (requestInFlight.current || busy) return;
    const input = validateRecoveryEmail(email);
    if (!input.ok) { setMessage(input.message); return; }
    requestInFlight.current = true;
    const generation = accountGeneration.current;
    setBusy(true); setMessage(null); clearError();
    try {
      const sent = await requestPasswordReset(input.email);
      if (generation === accountGeneration.current && sent) {
        setPassword('');
        // Avoid revealing whether an email address is registered.
        setMessage('If this address has an account, password recovery instructions will arrive by email.');
      }
    } catch {
      if (generation === accountGeneration.current) setMessage('Password recovery is temporarily unavailable.');
    } finally {
      if (generation === accountGeneration.current) { requestInFlight.current = false; setBusy(false); }
    }
  };
  const completeRecovery = async () => {
    if (requestInFlight.current || !recoverySession) return;
    const validation = validatePasswordConfirmation(newPassword, confirmPassword);
    if (!validation.ok) { setMessage(validation.message); return; }
    requestInFlight.current = true;
    const generation = accountGeneration.current;
    setBusy(true); setMessage(null); clearError();
    try {
      const ok = await updateRecoveryPassword(newPassword);
      if (generation === accountGeneration.current && ok) setMessage('Password updated. Sign in again with your new password.');
    } catch { if (generation === accountGeneration.current) setMessage('Could not update your password.'); }
    finally { if (generation === accountGeneration.current) { setNewPassword(''); setConfirmPassword(''); requestInFlight.current = false; setBusy(false); } }
  };
  const save = async () => {
    if (!session || requestInFlight.current || profileLoading || profileError) return;
    // Use the same Unicode-aware constraints as the persistence layer.
    try { validateProfileDraft({ display_name: displayName, bio, intent }); }
    catch { setMessage('Use a 2–40 character display name and a bio of up to 280 characters. Control characters are not allowed.'); return; }
    requestInFlight.current = true;
    const generation = accountGeneration.current;
    setBusy(true); setMessage(null);
    try {
      const snapshot = savedProfileSnapshot({ display_name: displayName, bio, intent });
      await saveMyProfile({ id: session.user.id, ...snapshot });
      if (generation === accountGeneration.current) { setSavedProfile(snapshot); setDisplayName(snapshot.display_name); setBio(snapshot.bio); setProfileExists(true); }
      if (generation === accountGeneration.current) setMessage('Profile saved. You are not visible at any venue until you explicitly check in.');
    } catch { if (generation === accountGeneration.current) setMessage('Profile could not be saved and verified. Check your connection or account permissions, then retry.'); }
    finally { if (generation === accountGeneration.current) { setBusy(false); requestInFlight.current = false; } }
  };
  const performSignOut = async () => {
        if (requestInFlight.current) return;
        requestInFlight.current = true;
        const generation = accountGeneration.current;
        setBusy(true);
        void signOut().then(ok => {
          if (!ok && generation === accountGeneration.current) setMessage('Sign out failed. Please retry.');
        }).catch(() => {
          if (generation === accountGeneration.current) setMessage('Sign out failed. Please retry.');
        }).finally(() => {
          if (generation === accountGeneration.current) { requestInFlight.current = false; setBusy(false); }
        });

  };
  return <Panel>
    <Text style={styles.title}>{session ? 'Your account' : 'Account & identity'}</Text>
    {!isBackendConfigured ? <Text style={styles.copy}>Connect a Supabase project to enable real registration and profiles. No demo account is simulated.</Text>
    : loading ? <ActivityIndicator color={theme.colors.cyan} />
    : recoverySession && session ? <View style={styles.stack}>
      <Text style={styles.copy}>Set a new password for your account. This screen appears only after opening a valid recovery link in the app.</Text>
      <TextInput accessibilityLabel="New password" editable={!busy} secureTextEntry textContentType="newPassword" autoComplete="new-password" maxLength={1024} style={styles.input} placeholder="New password (at least 8 characters)" placeholderTextColor={theme.colors.faint} value={newPassword} onChangeText={setNewPassword} />
      <TextInput accessibilityLabel="Confirm new password" editable={!busy} secureTextEntry textContentType="newPassword" autoComplete="off" maxLength={1024} style={styles.input} placeholder="Confirm new password" placeholderTextColor={theme.colors.faint} value={confirmPassword} onChangeText={setConfirmPassword} />
      <Pressable accessibilityRole="button" accessibilityLabel="Update password" accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => void completeRecovery()} style={styles.button}><Text style={styles.buttonText}>{busy ? 'Updating…' : 'Update password'}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Cancel password recovery and sign out" accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => {
        if (requestInFlight.current) return;
        requestInFlight.current = true;
        setBusy(true);
        void cancelRecovery().finally(() => { requestInFlight.current = false; setBusy(false); setNewPassword(''); setConfirmPassword(''); });
      }}><Text style={styles.link}>Cancel recovery and sign out</Text></Pressable>
    </View>
    : session ? <View style={styles.stack}>
      <Text style={styles.copy}>Signed in as {session.user.email ?? 'your account'}</Text>
      {profileLoading ? <ActivityIndicator color={theme.colors.cyan} /> : profileError ?
        <Pressable accessibilityRole="button" accessibilityLabel="Retry loading profile" disabled={busy} onPress={() => { if (!requestInFlight.current) setProfileReload(n => n + 1); }} style={styles.button}><Text style={styles.buttonText}>Retry loading profile</Text></Pressable> : <>
        {!profileExists ? <Text style={styles.copy}>Complete your profile to get started. Your profile is private by default.</Text> : null}
        <TextInput accessibilityLabel="Display name" editable={!busy && !profileLoading} autoCorrect={false} autoCapitalize="words" returnKeyType="done" style={styles.input} placeholder="Display name" placeholderTextColor={theme.colors.faint} value={displayName} onChangeText={setDisplayName} maxLength={40} />
        <TextInput accessibilityLabel="Bio" editable={!busy && !profileLoading} style={[styles.input, styles.bio]} multiline placeholder="A little about you" placeholderTextColor={theme.colors.faint} value={bio} onChangeText={setBio} maxLength={280} />
        <Text style={styles.copy}>Bio: {Array.from(bio).length}/280 characters</Text>
        <Text style={styles.copy}>What brings you out?</Text>
        <View style={styles.choices}>{intents.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: intent === item, disabled: busy || profileLoading }} disabled={busy || profileLoading} onPress={() => setIntent(item)} style={[styles.chip, intent === item && styles.selected]}><Text style={styles.chipText}>{item}</Text></Pressable>)}</View>
        {dirty ? <Text style={styles.copy}>Unsaved profile changes</Text> : profileExists ? <Text style={styles.copy}>Profile is up to date</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Save profile" accessibilityState={{ disabled: busy || profileLoading || profileError || (profileExists && !dirty) }} disabled={busy || profileLoading || profileError || (profileExists && !dirty)} onPress={() => void save()} style={styles.button}><Text style={styles.buttonText}>{busy ? 'Saving…' : 'Save profile'}</Text></Pressable>
      </>}
      <Pressable accessibilityRole="button" accessibilityLabel="Sign out" accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => {
        if (dirty) { Alert.alert('Discard profile changes?', 'Your unsaved edits will be lost if you sign out.', [{ text: 'Keep editing', style: 'cancel' }, { text: 'Discard and sign out', style: 'destructive', onPress: () => void performSignOut() }]); return; }
        void performSignOut();
      }}><Text style={styles.link}>Sign out</Text></Pressable>
    </View> : <View style={styles.stack}>
      <View style={styles.choices}><Pressable accessibilityRole="button" accessibilityState={{ selected: mode === 'sign-in', disabled: busy }} disabled={busy} onPress={() => { setMode('sign-in'); setAwaitingConfirmation(null); setMessage(null); clearError(); }}><Text style={styles.link}>Sign in</Text></Pressable><Pressable accessibilityRole="button" accessibilityState={{ selected: mode === 'sign-up', disabled: busy }} disabled={busy} onPress={() => { setMode('sign-up'); setAwaitingConfirmation(null); setMessage(null); clearError(); }}><Text style={styles.link}>Create account</Text></Pressable></View>
      <TextInput accessibilityLabel="Email" editable={!busy} maxLength={254} autoCorrect={false} textContentType="emailAddress" autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={styles.input} placeholder="Email" placeholderTextColor={theme.colors.faint} value={email} onChangeText={value => { setEmail(value); if (awaitingConfirmation && value.trim() !== awaitingConfirmation) { setAwaitingConfirmation(null); setConfirmationCooldownUntil(0); } }} />
      <TextInput accessibilityLabel="Password" editable={!busy} maxLength={1024} textContentType={mode === 'sign-up' ? 'newPassword' : 'password'} secureTextEntry autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} style={styles.input} placeholder="Password" placeholderTextColor={theme.colors.faint} value={password} onChangeText={setPassword} />
      <Pressable accessibilityRole="button" accessibilityLabel={mode === 'sign-in' ? 'Sign in' : 'Create account'} disabled={busy} onPress={() => void submit()} style={styles.button}><Text style={styles.buttonText}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</Text></Pressable>
      {mode === 'sign-up' && awaitingConfirmation ? <View style={styles.stack}><Text style={styles.copy}>Confirmation pending for {awaitingConfirmation}. You can sign in after verifying your email.</Text><Pressable accessibilityRole="button" accessibilityLabel="Resend confirmation email" accessibilityState={{ disabled: busy || Date.now() < confirmationCooldownUntil }} disabled={busy || Date.now() < confirmationCooldownUntil} onPress={() => void resendSignupConfirmation()}><Text style={styles.link}>Resend confirmation email (available after 60 seconds)</Text></Pressable></View> : null}
      {mode === 'sign-in' ? <Pressable accessibilityRole="button" accessibilityLabel="Request password reset email" accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => void recoverPassword()}><Text style={styles.link}>Forgot password?</Text></Pressable> : null}
    </View>}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {message ? <Text style={styles.copy}>{message}</Text> : null}
  </Panel>;
}
const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 15, fontWeight: '800', marginBottom: 8 },
  copy: { color: theme.colors.muted, fontSize: 12, lineHeight: 19 },
  stack: { gap: 12 },
  input: { color: theme.colors.text, backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  bio: { minHeight: 75, textAlignVertical: 'top' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { borderWidth: 1, borderColor: theme.colors.border, padding: 9, borderRadius: 12 },
  selected: { backgroundColor: theme.colors.violet, borderColor: theme.colors.violet },
  chipText: { color: theme.colors.text, textTransform: 'capitalize', fontSize: 12 },
  button: { padding: 14, backgroundColor: theme.colors.violet, borderRadius: 13, alignItems: 'center' },
  buttonText: { color: theme.colors.text, fontWeight: '800' },
  link: { color: theme.colors.cyan, fontWeight: '700', fontSize: 13 },
  error: { color: theme.colors.danger, fontSize: 12 },
});
