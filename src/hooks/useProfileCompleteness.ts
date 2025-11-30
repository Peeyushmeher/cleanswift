import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { supabase } from '../lib/supabase';

interface UseProfileCompletenessReturn {
  isComplete: boolean;
  missingItems: string[];
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to check if user profile is complete
 * Profile is complete when:
 * - full_name is not null/empty
 * - phone is not null/empty
 * - At least one car exists
 * - At least one address exists in user_addresses table
 */
export function useProfileCompleteness(): UseProfileCompletenessReturn {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [isComplete, setIsComplete] = useState(false);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkCompleteness = async () => {
    if (!user) {
      setIsComplete(false);
      setMissingItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Checking profile completeness for user:', user.id);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles

      // PGRST116 means no rows found - this is expected for new users
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const profile = profileData || null;

      // Fetch cars
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('id')
        .eq('user_id', user.id);

      if (carsError) {
        throw carsError;
      }

      // Fetch addresses from user_addresses table
      const { data: addresses, error: addressesError } = await supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (addressesError) {
        throw addressesError;
      }

      // Build missing items array
      const missing: string[] = [];

      // If no profile exists, all profile fields are missing
      if (!profile) {
        missing.push('Profile');
        missing.push('Full name');
        missing.push('Phone number');
      } else {
        if (!profile.full_name || profile.full_name.trim() === '') {
          missing.push('Full name');
        }

        if (!profile.phone || profile.phone.trim() === '') {
          missing.push('Phone number');
        }
      }

      // Check for cars (always check, regardless of profile existence)
      if (!cars || cars.length === 0) {
        missing.push('At least one vehicle');
      }

      // Check for address in user_addresses table (always check, regardless of profile existence)
      if (!addresses || addresses.length === 0) {
        missing.push('Address');
      }

      setMissingItems(missing);
      const complete = missing.length === 0;
      setIsComplete(complete);
      console.log('Profile completeness check:', {
        complete,
        missingItems: missing,
        hasProfile: !!profile,
        hasCars: !!(cars && cars.length > 0),
        hasAddress: !!(addresses && addresses.length > 0),
      });
    } catch (error) {
      console.error('Error checking profile completeness:', error);
      setIsComplete(false);
      setMissingItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCompleteness();
  }, [user, profile]); // Refetch when user or profile changes

  return {
    isComplete,
    missingItems,
    loading,
    refetch: checkCompleteness,
  };
}

