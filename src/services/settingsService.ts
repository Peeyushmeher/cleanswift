import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

/**
 * Service for managing user settings and account operations
 */

/**
 * Change user password
 * @param currentPassword - Current password for verification
 * @param newPassword - New password to set
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error: Error | null }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: new Error('User not authenticated') };
    }

    // Verify current password by attempting sign-in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return { error: new Error('Current password is incorrect') };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: updateError };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Failed to change password') };
  }
}

/**
 * Clear all app cache and stored data
 */
export async function clearCache(): Promise<{ error: Error | null }> {
  try {
    // Get all keys from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter out Supabase auth keys (we want to keep the session)
    const authKeys = keys.filter(key => 
      key.startsWith('supabase.auth.token') || 
      key.startsWith('sb-') && key.includes('auth-token')
    );

    // Remove all non-auth keys
    const keysToRemove = keys.filter(key => !authKeys.includes(key));
    await AsyncStorage.multiRemove(keysToRemove);

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Failed to clear cache') };
  }
}

/**
 * Download all user data as JSON
 */
export async function downloadUserData(): Promise<{ data: any; error: Error | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Fetch all user data from different tables
    const [profile, cars, addresses, bookings, reviews, favorites, preferences, notifications] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('cars').select('*').eq('user_id', user.id),
      supabase.from('user_addresses').select('*').eq('user_id', user.id),
      supabase.from('bookings').select('*').eq('user_id', user.id),
      supabase.from('reviews').select('*').eq('user_id', user.id),
      supabase.from('favorite_detailers').select('*').eq('user_id', user.id),
      supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
      supabase.from('notification_settings').select('*').eq('user_id', user.id).single(),
    ]);

    const userData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profile.data,
      cars: cars.data,
      addresses: addresses.data,
      bookings: bookings.data,
      reviews: reviews.data,
      favorite_detailers: favorites.data,
      preferences: preferences.data,
      notification_settings: notifications.data,
    };

    return { data: userData, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to download user data') 
    };
  }
}

/**
 * Delete user account and all associated data
 * WARNING: This is a destructive operation that cannot be undone
 * 
 * Calls the delete-user-account Edge Function which uses the Supabase Admin API
 * to permanently delete the user. CASCADE constraints automatically clean up
 * related data (profiles, cars, addresses, bookings, etc.)
 */
export async function deleteAccount(): Promise<{ error: Error | null }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { error: new Error('User not authenticated') };
    }

    // Get Supabase URL for Edge Function call
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return { error: new Error('Supabase URL not configured') };
    }

    // Call the delete-user-account Edge Function
    const functionUrl = `${supabaseUrl}/functions/v1/delete-user-account`;
    
    console.log('📞 Calling delete-user-account Edge Function...');

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({}),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || 'Failed to delete account';
      console.error('❌ Account deletion failed:', errorMessage);
      return { error: new Error(errorMessage) };
    }

    console.log('✅ Account deleted successfully');

    // Sign out locally to clear the session
    await supabase.auth.signOut();

    return { error: null };
  } catch (error) {
    console.error('deleteAccount error:', error);
    return { error: error instanceof Error ? error : new Error('Failed to delete account') };
  }
}

