import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Expo SDK 54+ automatically loads .env files with EXPO_PUBLIC_ prefix
// IMPORTANT: You must restart the Expo dev server after creating/updating .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Enhanced debugging to help diagnose env variable loading
console.log('=== Supabase Environment Variables Debug ===');
console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl || '❌ MISSING - Check .env file or EAS secrets');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✅ Loaded (${supabaseAnonKey.length} chars)` : '❌ MISSING - Check .env file or EAS secrets');
console.log('All EXPO_PUBLIC_* env vars:', Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_')).join(', ') || 'None found');

// Don't throw error - create a dummy client instead to prevent app crash
// The app will show an error screen if these are missing
let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'exists' : 'MISSING');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'exists' : 'MISSING');
  console.error('For EAS builds, set secrets with: eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value <url>');
  
  // Create a dummy client with placeholder values to prevent crash
  // The app will handle the error gracefully
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = supabaseClient;

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};
