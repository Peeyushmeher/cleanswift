import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug: Log what we're getting from env
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'exists' : 'missing');

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
