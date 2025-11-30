/**
 * Demo Data Configuration
 *
 * Central repository for all hardcoded demo/static data used in screens.
 * This file contains placeholder data that will eventually be replaced by
 * real data from Supabase as features are implemented.
 */

// ============================================================================
// BOOKING FLOW DEMO DATA
// ============================================================================

/**
 * Demo dates for booking date selection
 * Used in: BookingDateTimeScreen
 */
export const DEMO_DATES = [
  { day: 'Mon', date: 13, available: false },
  { day: 'Tue', date: 14, available: false },
  { day: 'Wed', date: 15, available: false },
  { day: 'Thu', date: 16, available: true },
  { day: 'Fri', date: 17, available: true },
  { day: 'Sat', date: 18, available: true },
  { day: 'Sun', date: 19, available: true },
];

/**
 * Demo time slots for booking time selection
 * Used in: BookingDateTimeScreen
 */
export const DEMO_TIME_SLOTS = [
  { time: '8:00 AM', available: true },
  { time: '9:30 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '1:00 PM', available: true },
  { time: '3:30 PM', available: true },
  { time: '5:00 PM', available: false },
  { time: '6:30 PM', available: false },
  { time: '8:00 PM', available: false },
];

/**
 * Demo saved payment cards
 * Used in: PaymentMethodScreen
 */
export const DEMO_SAVED_CARDS = [
  { id: '1', type: 'visa', last4: '2741', expiry: '10/27' },
  { id: '2', type: 'mastercard', last4: '8392', expiry: '03/26' },
];

// ============================================================================
// SERVICE PROGRESS DEMO DATA
// ============================================================================

/**
 * Demo service progress steps
 * Used in: ServiceProgressScreen
 */
export const DEMO_SERVICE_STEPS = [
  { id: 1, title: 'Arrived', subtitle: 'Detailer is preparing equipment', icon: 'location' as const, status: 'completed' },
  { id: 2, title: 'Cleaning Exterior', subtitle: 'Deep cleaning your car', icon: 'water' as const, status: 'current' },
  { id: 3, title: 'Detailing Interior', subtitle: 'Interior refresh and detailing', icon: 'sparkles' as const, status: 'upcoming' },
  { id: 4, title: 'Final Touches', subtitle: 'Adding finishing treatments', icon: 'checkmark' as const, status: 'upcoming' },
];

// ============================================================================
// RECEIPT & RATING DEMO DATA
// ============================================================================

/**
 * Demo tip amount options
 * Used in: ReceiptRatingScreen
 */
export const DEMO_TIP_AMOUNTS = ['$5', '$10', '$20', 'Custom'];

/**
 * Demo receipt data
 * Used in: ReceiptRatingScreen
 */
export const DEMO_RECEIPT_DATA = {
  serviceName: 'Full Exterior Detail',
  completedAt: '2:42 PM',
  price: '$149.00',
  carModel: '2021 BMW M4',
  licensePlate: 'ABC-123',
};

// ============================================================================
// LIVE TRACKING DEMO DATA
// ============================================================================

/**
 * Demo detailer tracking information
 * Used in: LiveTrackingScreen
 */
export const DEMO_DETAILER = {
  name: 'Marcus',
  arrivalTime: '12–18 minutes',
};
