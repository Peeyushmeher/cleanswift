import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserAddress {
  id: string;
  user_id: string;
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface UseUserAddressesReturn {
  addresses: UserAddress[];
  loading: boolean;
  error: Error | null;
  defaultAddress: UserAddress | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>, autoGenerateName?: boolean) => Promise<UserAddress>;
  updateAddress: (id: string, updates: Partial<Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

/**
 * Hook to manage user saved addresses
 */
export function useUserAddresses(): UseUserAddressesReturn {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching addresses:', fetchError);
        // Check if it's a table not found error
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          throw new Error('Address table not found. Please run the database migration: 20250125000002_create_user_addresses.sql');
        }
        throw fetchError;
      }
      setAddresses((data as UserAddress[]) || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load addresses';
      setError(new Error(errorMessage));
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = useCallback(
    async (
      address: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
      autoGenerateName = false
    ): Promise<UserAddress> => {
      if (!user) {
        throw new Error('User must be logged in to add an address');
      }

      try {
        // Auto-generate name if not provided and autoGenerateName is true
        let addressName = address.name;
        if (!addressName && autoGenerateName) {
          const existingCount = addresses.length;
          addressName = `Address ${existingCount + 1}`;
        }

        if (!addressName) {
          throw new Error('Address name is required');
        }

        // If setting as default, ensure no other address is default
        // (The database trigger handles this, but we can also do it here for clarity)
        const isDefault = address.is_default ?? false;

        const { data, error: insertError } = await supabase
          .from('user_addresses')
          .insert({
            user_id: user.id,
            name: addressName,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || null,
            city: address.city,
            province: address.province,
            postal_code: address.postal_code,
            latitude: address.latitude || null,
            longitude: address.longitude || null,
            is_default: isDefault,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Refresh addresses list
        await fetchAddresses();

        return data as UserAddress;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to add address');
      }
    },
    [user, addresses.length, fetchAddresses]
  );

  const updateAddress = useCallback(
    async (id: string, updates: Partial<Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user) {
        throw new Error('User must be logged in to update an address');
      }

      try {
        const { error: updateError } = await supabase
          .from('user_addresses')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Refresh addresses list
        await fetchAddresses();
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to update address');
      }
    },
    [user, fetchAddresses]
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('User must be logged in to delete an address');
      }

      try {
        const { error: deleteError } = await supabase
          .from('user_addresses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Refresh addresses list
        await fetchAddresses();
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to delete address');
      }
    },
    [user, fetchAddresses]
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('User must be logged in to set default address');
      }

      try {
        // First, unset all other defaults for this user
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);

        // Then set this address as default
        const { error: updateError } = await supabase
          .from('user_addresses')
          .update({ is_default: true })
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Refresh addresses list
        await fetchAddresses();
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to set default address');
      }
    },
    [user, fetchAddresses]
  );

  const defaultAddress = addresses.find((addr) => addr.is_default) || null;

  return {
    addresses,
    loading,
    error,
    defaultAddress,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}

