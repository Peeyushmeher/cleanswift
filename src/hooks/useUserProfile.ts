import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'user' | 'detailer' | 'admin';
  avatar_url: string | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  isDetailer: boolean;
  isAdmin: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch current user's profile and role
 */
export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, avatar_url')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data as UserProfile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    isDetailer: profile?.role === 'detailer' || profile?.role === 'admin',
    isAdmin: profile?.role === 'admin',
    refetch: fetchProfile,
  };
}

