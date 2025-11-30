/**
 * Domain Types
 *
 * Central repository for all core domain entity types used across the CleanSwift app.
 * These types match the database schema and represent the fundamental business objects.
 */

/**
 * Service - A car detailing service offering
 */
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  display_order: number;
}

/**
 * ServiceAddon - An optional add-on for a service
 */
export interface ServiceAddon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  display_order: number;
}

/**
 * Car - A user's vehicle
 */
export interface Car {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: string;
  trim: string | null;
  license_plate: string;
  color: string | null;
  photo_url: string | null;
  is_primary: boolean;
}

/**
 * Detailer - A service provider who performs detailing services
 */
export interface Detailer {
  id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  years_experience: number;
  is_active: boolean;
}

/**
 * BookingLocation - Address information for a service booking
 */
export interface BookingLocation {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  province: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  location_notes?: string | null;
}

/**
 * PaymentMethod - Payment method information
 */
export interface PaymentMethod {
  type: 'card' | 'cash' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  cardId?: string;
}

/**
 * PriceBreakdown - Detailed price calculation for a booking
 */
export interface PriceBreakdown {
  servicePrice: number;
  addonsTotal: number;
  taxAmount: number;
  totalAmount: number;
}
