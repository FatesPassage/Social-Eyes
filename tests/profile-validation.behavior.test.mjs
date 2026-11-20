import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
let src = fs.readFileSync(path.join(root, 'src/lib/profileValidation.ts'), 'utf8');
src = src.replace(/^export type .*\n/gm, '').replace(/^import type .*\n/gm, '').replace(/^const VALID_INTENTS: ReadonlySet<string>/m, 'const VALID_INTENTS')
  .replace('export function validateProfileDraft(input: unknown): Omit<PublicProfile, \'id\'>', 'function validateProfileDraft(input)')
  .replaceAll('input as Record<string, unknown>', 'input').replace('draft.intent as SocialIntent', 'draft.intent')
  .replace('export function validateProfileRecord(input: unknown, expectedUserId: string): PublicProfile', 'function validateProfileRecord(input, expectedUserId)');
const context = {};
vm.runInNewContext(`${src}\nthis.validate = validateProfileDraft; this.validateRecord = validateProfileRecord`, context);
const validate = context.validate;
test('profile validation trims and allowlists fields', () => {
  const result = validate({ id: 'forged', display_name: '  Alex  ', bio: '  Hello  ', intent: 'friends', admin: true });
  assert.equal(JSON.stringify(result), JSON.stringify({ display_name: 'Alex', bio: 'Hello', intent: 'friends' }));
});
test('profile validation rejects invalid types and intent', () => {
  for (const value of [null, [], {}, { display_name: 'Alex', bio: 7, intent: 'friends' }, { display_name: 'Alex', bio: '', intent: 'admin' }]) assert.throws(() => validate(value));
});
test('profile validation enforces name and bio limits', () => {
  for (const value of [{ display_name: ' A ', bio: '', intent: 'dating' }, { display_name: 'A'.repeat(41), bio: '', intent: 'dating' }, { display_name: 'Alex', bio: 'b'.repeat(281), intent: 'dating' }]) assert.throws(() => validate(value));
  assert.equal(validate({ display_name: 'Alex', bio: 'b'.repeat(280), intent: 'events' }).bio.length, 280);
});
test('profile writes verify current authenticated owner and use allowlisted payload', () => {
  const src = fs.readFileSync(path.join(root, 'src/lib/profiles.ts'), 'utf8');
  assert.match(src, /supabase\.auth\.getUser\(\)/);
  assert.match(src, /identity\.user\.id !== profile\.id/);
  assert.match(src, /id: identity\.user\.id, \.\.\.validated/);
});

test('database profile responses reject wrong owners and malformed fields', () => {
  const valid = { id: 'user-a', display_name: 'Alex', bio: 'Hi', intent: 'friends' };
  assert.equal(context.validateRecord(valid, 'user-a').id, 'user-a');
  assert.throws(() => context.validateRecord(valid, 'user-b'));
  assert.throws(() => context.validateRecord({ ...valid, display_name: ' Alex ' }, 'user-a'));
  assert.throws(() => context.validateRecord({ ...valid, intent: 'administrator' }, 'user-a'));
});
test('profile reads authenticate owner and validate server response', () => {
  const source = fs.readFileSync(path.join(root, 'src/lib/profiles.ts'), 'utf8');
  assert.match(source, /identity\.user\.id !== userId/);
  assert.match(source, /validateProfileRecord\(data, current\.user\.id\)/);
});
