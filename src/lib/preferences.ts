import AsyncStorage from '@react-native-async-storage/async-storage';
const WELCOME_KEY = 'social-eyes:welcome-complete:v1';
export async function hasCompletedWelcome(): Promise<boolean> {
  return (await AsyncStorage.getItem(WELCOME_KEY)) === 'true';
}
export async function markWelcomeComplete(): Promise<void> {
  await AsyncStorage.setItem(WELCOME_KEY, 'true');
}

/** Test-only reset hook; never called from production navigation. */
export async function resetWelcomeForTesting(): Promise<void> {
  await AsyncStorage.removeItem(WELCOME_KEY);
}
