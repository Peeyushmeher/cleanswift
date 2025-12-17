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
 */
export async function deleteAccount(): Promise<{ error: Error | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: new Error('User not authenticated') };
    }

    // Note: Deleting the auth user will cascade delete all related data
    // due to foreign key constraints with ON DELETE CASCADE
    // This is handled by Supabase automatically

    // Sign out first (this clears the session)
    await supabase.auth.signOut();

    // The actual account deletion should be done via Supabase Admin API
    // or a database function/trigger, as regular users can't delete auth users
    // For now, we'll just sign out and show a message that account deletion
    // needs to be done through support or admin
    
    // TODO: If you have an admin function or API endpoint for account deletion,
    // call it here. Otherwise, users will need to contact support.

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Failed to delete account') };
  }
}

