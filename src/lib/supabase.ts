import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo SDK 54+ automatically loads .env files with EXPO_PUBLIC_ prefix
// IMPORTANT: You must restart the Expo dev server after creating/updating .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Enhanced debugging to help diagnose env variable loading
console.log('=== Supabase Environment Variables Debug ===');
console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl || '❌ MISSING - Check .env file');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✅ Loaded (${supabaseAnonKey.length} chars)` : '❌ MISSING - Check .env file');
console.log('All EXPO_PUBLIC_* env vars:', Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_')).join(', ') || 'None found');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables:
    EXPO_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'exists' : 'MISSING'}
    EXPO_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'exists' : 'MISSING'}

    Make sure .env file exists and server was restarted.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
