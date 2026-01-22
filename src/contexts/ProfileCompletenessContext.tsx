import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface ProfileCompletenessContextType {
  isComplete: boolean;
  missingItems: string[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const ProfileCompletenessContext = createContext<ProfileCompletenessContextType | undefined>(undefined);

/**
 * Provider for profile completeness state
 * This ensures all components share the same completeness state,
 * so when OnboardingWizard triggers a refetch, RootNavigator sees the update
 */
export function ProfileCompletenessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState(false);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkCompleteness = useCallback(async () => {
    if (!user) {
      setIsComplete(false);
      setMissingItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('ProfileCompletenessContext: Checking completeness for user:', user.id);

      // Fetch profile with onboarding_completed flag
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      // PGRST116 means no rows found - this is expected for new users
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const profile = profileData || null;

      // If user has completed onboarding before, skip the completeness check
      if (profile?.onboarding_completed === true) {
        console.log('ProfileCompletenessContext: User has completed onboarding before');
        setIsComplete(true);
        setMissingItems([]);
        setLoading(false);
        return;
      }

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

      if (!cars || cars.length === 0) {
        missing.push('At least one vehicle');
      }

      if (!addresses || addresses.length === 0) {
        missing.push('Address');
      }

      setMissingItems(missing);
      const complete = missing.length === 0;
      setIsComplete(complete);
      
      console.log('ProfileCompletenessContext: Check result:', {
        complete,
        missingItems: missing,
        hasProfile: !!profile,
        hasCars: !!(cars && cars.length > 0),
        hasAddress: !!(addresses && addresses.length > 0),
      });
    } catch (error) {
      console.error('ProfileCompletenessContext: Error checking completeness:', error);
      setIsComplete(false);
      setMissingItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check completeness when user changes
  useEffect(() => {
    checkCompleteness();
  }, [user, checkCompleteness]);

  const value = {
    isComplete,
    missingItems,
    loading,
    refetch: checkCompleteness,
  };

  return (
    <ProfileCompletenessContext.Provider value={value}>
      {children}
    </ProfileCompletenessContext.Provider>
  );
}

/**
 * Hook to access profile completeness state
 * All components using this hook share the same state
 */
export function useProfileCompleteness() {
  const context = useContext(ProfileCompletenessContext);
  if (context === undefined) {
    throw new Error('useProfileCompleteness must be used within a ProfileCompletenessProvider');
  }
  return context;
}
