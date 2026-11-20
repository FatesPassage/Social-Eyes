import { supabase } from '@/lib/supabase';
import { validateProfileDraft, validateProfileRecord } from '@/lib/profileValidation';
import type { PublicProfile, SocialIntent } from '@/lib/profileValidation';
export type { PublicProfile, SocialIntent };

async function requireOwner(expectedId: string, changedMessage: string): Promise<string> {
  if (!supabase) throw new Error('Backend not configured');
  const { data: identity, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!identity.user || identity.user.id !== expectedId) throw new Error(changedMessage);
  return identity.user.id;
}

export async function getMyProfile(userId: string): Promise<PublicProfile | null> {
  if (!supabase) throw new Error('Backend not configured');
  await requireOwner(userId, 'Profile owner mismatch');
  const { data, error } = await supabase.from('profiles').select('id,display_name,bio,intent').eq('id', userId).maybeSingle();
  if (error) throw error;
  const { data: current, error: currentError } = await supabase.auth.getUser();
  if (currentError) throw currentError;
  if (!current.user || current.user.id !== userId) throw new Error('Profile owner changed during request');
  if (!data) return null;
  return validateProfileRecord(data, current.user.id);
}

let saveInFlight = false;
export async function saveMyProfile(profile: PublicProfile): Promise<PublicProfile> {
  if (saveInFlight) throw new Error('Profile save already in progress');
  saveInFlight = true;
  try {
    if (!supabase) throw new Error('Backend not configured');
    const { data: identity, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!identity.user || identity.user.id !== profile.id) throw new Error('Profile owner mismatch');
    const validated = validateProfileDraft(profile);
    await requireOwner(identity.user.id, 'Profile owner changed before write');
    const { error } = await supabase.from('profiles').upsert({ id: identity.user.id, ...validated }, { onConflict: 'id' });
    if (error) throw error;
    const confirmed = await getMyProfile(identity.user.id);
    if (!confirmed || confirmed.display_name !== validated.display_name ||
      confirmed.bio !== validated.bio || confirmed.intent !== validated.intent) {
      throw new Error('Profile save could not be verified');
    }
    return confirmed;
  } finally {
    saveInFlight = false;
  }
}
