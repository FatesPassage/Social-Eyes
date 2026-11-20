import { validateProfileDraft } from '@/lib/profileValidation';
import type { PublicProfile, SocialIntent } from '@/lib/profileValidation';
export type ProfileDraft = { display_name: string; bio: string; intent: SocialIntent };
export function hasProfileChanges(current: ProfileDraft, saved: ProfileDraft | null): boolean {
  const now = { display_name: current.display_name.trim(), bio: current.bio.trim(), intent: current.intent };
  if (!saved) return Boolean(now.display_name || now.bio || now.intent !== 'friends');
  const previous = { display_name: saved.display_name.trim(), bio: saved.bio.trim(), intent: saved.intent };
  return now.display_name !== previous.display_name || now.bio !== previous.bio || now.intent !== previous.intent;
}
export function savedProfileSnapshot(input: ProfileDraft): Omit<PublicProfile, 'id'> {
  return validateProfileDraft(input);
}
