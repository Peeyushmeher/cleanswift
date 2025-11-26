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
 * - address_line1, city, province, postal_code are all not null/empty
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
        .select('full_name, phone, address_line1, city, province, postal_code')
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

      // Build missing items array
      const missing: string[] = [];

      // If no profile exists, all fields are missing
      if (!profile) {
        missing.push('Profile');
        missing.push('Full name');
        missing.push('Phone number');
        missing.push('At least one vehicle');
        missing.push('Address');
        missing.push('City');
        missing.push('Province');
        missing.push('Postal code');
      } else {
        if (!profile.full_name || profile.full_name.trim() === '') {
          missing.push('Full name');
        }

        if (!profile.phone || profile.phone.trim() === '') {
          missing.push('Phone number');
        }
      }

      if (!cars || cars.length === 0) {
        missing.push('At least one vehicle');
      }

      if (profile) {
        if (!profile.address_line1 || profile.address_line1.trim() === '') {
          missing.push('Address');
        }

        if (!profile.city || profile.city.trim() === '') {
          missing.push('City');
        }

        if (!profile.province || profile.province.trim() === '') {
          missing.push('Province');
        }

        if (!profile.postal_code || profile.postal_code.trim() === '') {
          missing.push('Postal code');
        }
      }

      setMissingItems(missing);
      const complete = missing.length === 0;
      setIsComplete(complete);
      console.log('Profile completeness check:', {
        complete,
        missingItems: missing,
        hasProfile: !!profile,
        hasCars: !!(cars && cars.length > 0),
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

