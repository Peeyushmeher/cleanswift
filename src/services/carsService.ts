// Cars Service: Handles car-related operations
import { supabase } from '../lib/supabase';
import type { Car } from '../types/domain';

interface CreateCarData {
  make: string;
  model: string;
  year: string;
  trim?: string | null;
  license_plate: string;
  color?: string | null;
  photo_url?: string | null;
  is_primary?: boolean;
}

interface UpdateCarData {
  make?: string;
  model?: string;
  year?: string;
  trim?: string | null;
  license_plate?: string;
  color?: string | null;
  photo_url?: string | null;
  is_primary?: boolean;
}

/**
 * Fetches the user's primary car from Supabase
 * Returns null if no primary car is found
 */
export async function getPrimaryCar(userId: string): Promise<Car | null> {
  try {
    console.log('Fetching primary car for user:', userId);

    const { data: primaryCar, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle(); // Use maybeSingle() to handle 0 or 1 results

    if (error) {
      console.error('Error fetching primary car:', error);
      throw new Error(error.message || 'Failed to fetch primary car');
    }

    if (primaryCar) {
      console.log('Found primary car:', primaryCar.id);
      return primaryCar as Car;
    }

    console.log('No primary car found for user');
    return null;
  } catch (error) {
    console.error('getPrimaryCar error:', error);
    throw error;
  }
}

/**
 * Creates a new car record in Supabase
 * If is_primary is true, will unset other cars' primary status first
 */
export async function createCar(
  userId: string,
  carData: CreateCarData
): Promise<Car> {
  try {
    console.log('Creating car for user:', userId, carData);

    // If this is marked as primary, unset other primary cars first
    if (carData.is_primary) {
      await unsetPrimaryCars(userId);
    }

    const insertPayload = {
      user_id: userId,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      trim: carData.trim || null,
      license_plate: carData.license_plate,
      color: carData.color || null,
      photo_url: carData.photo_url || null,
      is_primary: carData.is_primary ?? true, // Default to primary if not specified
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('cars')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create car:', error);
      throw new Error(error.message || 'Failed to create car');
    }

    if (!data) {
      throw new Error('No car data returned after creation');
    }

    console.log('Car created successfully:', data.id);
    return data as Car;
  } catch (error) {
    console.error('createCar error:', error);
    throw error;
  }
}

/**
 * Updates an existing car record in Supabase
 * If is_primary is set to true, will unset other cars' primary status first
 */
export async function updateCar(
  carId: string,
  carData: UpdateCarData
): Promise<Car> {
  try {
    console.log('Updating car:', carId, carData);

    // If setting this car as primary, unset other primary cars first
    if (carData.is_primary) {
      // Get the car's user_id first
      const { data: existingCar } = await supabase
        .from('cars')
        .select('user_id')
        .eq('id', carId)
        .single();

      if (existingCar) {
        await unsetPrimaryCars(existingCar.user_id);
      }
    }

    const updatePayload = {
      ...carData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('cars')
      .update(updatePayload)
      .eq('id', carId)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to update car:', error);
      throw new Error(error.message || 'Failed to update car');
    }

    if (!data) {
      throw new Error('No car data returned after update');
    }

    console.log('Car updated successfully:', data.id);
    return data as Car;
  } catch (error) {
    console.error('updateCar error:', error);
    throw error;
  }
}

/**
 * Deletes a car record from Supabase
 */
export async function deleteCar(carId: string): Promise<void> {
  try {
    console.log('Deleting car:', carId);

    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId);

    if (error) {
      console.error('Failed to delete car:', error);
      throw new Error(error.message || 'Failed to delete car');
    }

    console.log('Car deleted successfully:', carId);
  } catch (error) {
    console.error('deleteCar error:', error);
    throw error;
  }
}

/**
 * Helper function: Unsets the is_primary flag for all of a user's cars
 * Used before setting a new primary car
 */
async function unsetPrimaryCars(userId: string): Promise<void> {
  try {
    console.log('Unsetting primary cars for user:', userId);

    const { error } = await supabase
      .from('cars')
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_primary', true);

    if (error) {
      console.error('Failed to unset primary cars:', error);
      throw new Error(error.message || 'Failed to unset primary cars');
    }

    console.log('Primary cars unset successfully');
  } catch (error) {
    console.error('unsetPrimaryCars error:', error);
    throw error;
  }
}
