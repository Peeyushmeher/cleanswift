# Phase 4 Frontend Implementation Plan
## Service Radius / Travel Distance Logic Integration

---

## Overview

This document outlines the frontend implementation plan for Phase 4 backend integration. The backend now filters detailers by their service radius, ensuring only detailers within their allowed travel distance are matched with bookings.

**Backend Status:** ⚠️ Partially Complete
- ✅ Distance calculation function (`calculate_distance_km`)
- ✅ Availability check function (`check_detailer_availability_in_radius`)
- ✅ API endpoint (`POST /api/bookings/check-availability`)
- ✅ Booking matching with radius filtering
- ✅ Detailer location fields (latitude, longitude, service_radius_km)
- ❌ **MISSING:** Fallback logic for detailers with larger service radius

**Frontend Status:** ⏳ To Be Implemented

**Backend Enhancement Needed:**
The current `find_available_detailer()` function uses a strict filter: only matches detailers where `distance <= service_radius_km`. 

**Required Enhancement:** Add fallback logic:
1. **First pass:** Try detailers where `distance <= service_radius_km` (within their set radius)
2. **Second pass (if none found):** Try detailers where `service_radius_km >= distance` (their radius is large enough to cover the booking distance)
3. Order by distance (closest first), then rating

This ensures:
- Local detailers are prioritized (within their radius)
- If no local detailers available, expand to detailers with larger service radii
- Still respects detailer preferences (only matches if their radius covers the distance)

---

## Quick Summary

### What We're Building

1. **Availability Check Before Booking**
   - Check if detailers are available at booking location/time
   - Show user-friendly message if no detailers available
   - Allow user to try different time/location

2. **Detailer Location Management**
   - Collect location during detailer onboarding
   - Allow detailers to set/update their service radius
   - Store home base coordinates (lat/lng)

### Key Changes

- ✅ **Add:** `checkBookingAvailability()` API function
- ✅ **Add:** Availability check in booking flow (after geocoding)
- ✅ **Add:** "No Detailer Available" error UI component
- ✅ **Update:** Detailer onboarding to collect location/radius
- ✅ **Update:** Detailer profile to allow location/radius updates
- ✅ **Verify:** Booking creation includes lat/lng (already done)

### Implementation Approach

**Option A: Use Direct Supabase Updates (Recommended for Speed)**
- Use `supabase.from('detailers').update()` for location updates
- No backend RPC function changes needed
- Faster to implement

**Option B: Update Backend RPC Functions**
- Modify `create_detailer_profile` and `update_detailer_profile` to accept location params
- Requires backend migration
- More consistent with existing pattern

---

## Current State Analysis

### ✅ What's Already Working

1. **Geocoding Service** (`src/services/googleGeocoding.ts`)
   - ✅ Address to lat/lng conversion
   - ✅ Used in `CombinedSelectionScreen` for booking locations
   - ✅ Used in `OnboardingWizard` for user addresses

2. **Booking Creation** (`src/lib/bookings.ts`)
   - ✅ `createBooking()` function accepts `locationLat` and `locationLng`
   - ✅ Coordinates are passed to backend RPC function
   - ✅ Used in `OrderSummaryScreen` and `PaymentMethodScreen`

3. **Location Data Flow**
   - ✅ `BookingLocation` type includes `latitude` and `longitude`
   - ✅ Location data flows through `BookingContext`
   - ✅ Coordinates are geocoded before booking creation

### ❌ What Needs Implementation

1. **Availability Check API Function**
   - ❌ No function to call `/api/bookings/check-availability` endpoint
   - ❌ Need to add `checkBookingAvailability()` to `src/lib/bookings.ts`

2. **Availability Check Integration**
   - ❌ Not called before booking creation
   - ❌ No UI feedback when no detailers available
   - ❌ Need to integrate in `CombinedSelectionScreen` after geocoding

3. **"No Detailer Available" UI**
   - ❌ No component to show availability error message
   - ❌ No options to try different time/location
   - ❌ Need user-friendly error handling

4. **Detailer Onboarding**
   - ❌ No location collection during detailer signup
   - ❌ No service radius input field
   - ❌ Need to add location step to detailer onboarding

5. **Detailer Profile Updates**
   - ❌ Cannot update location or service radius
   - ❌ Need to add fields to detailer profile edit screen

---

## Implementation Plan

### Phase 0: Backend Enhancement (Required First)

#### Step 0.1: Update `find_available_detailer()` Function

**File:** `supabase/migrations/YYYYMMDDHHMMSS_add_fallback_radius_logic.sql` (new migration)

**Enhancement:** Add two-tier matching logic with fallback

**Current Logic (line 121):**
```sql
OR calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) <= COALESCE(d.service_radius_km, 50)
```

**New Logic:** Use a two-pass approach with CTE or UNION:
```sql
-- First pass: Detailers within their service radius
WITH within_radius AS (
  SELECT d.id, calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) as distance
  FROM detailers d
  INNER JOIN detailer_availability da ON da.detailer_id = d.id
  WHERE d.is_active = true
    AND da.is_active = true
    AND da.day_of_week = booking_day_of_week
    AND da.start_time <= booking_start_time
    AND da.end_time >= booking_end_time
    AND (NOT p_exclude_org_detailers OR d.organization_id IS NULL)
    AND p_booking_lat IS NOT NULL
    AND p_booking_lng IS NOT NULL
    AND d.latitude IS NOT NULL
    AND d.longitude IS NOT NULL
    AND calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) <= COALESCE(d.service_radius_km, 50)
    -- ... conflict checks ...
),
-- Second pass: Detailers with radius large enough (fallback)
fallback_radius AS (
  SELECT d.id, calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) as distance
  FROM detailers d
  INNER JOIN detailer_availability da ON da.detailer_id = d.id
  WHERE d.is_active = true
    AND da.is_active = true
    AND da.day_of_week = booking_day_of_week
    AND da.start_time <= booking_start_time
    AND da.end_time >= booking_end_time
    AND (NOT p_exclude_org_detailers OR d.organization_id IS NULL)
    AND p_booking_lat IS NOT NULL
    AND p_booking_lng IS NOT NULL
    AND d.latitude IS NOT NULL
    AND d.longitude IS NOT NULL
    AND calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) > COALESCE(d.service_radius_km, 50)  -- Outside their normal radius
    AND COALESCE(d.service_radius_km, 50) >= calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng)  -- But their radius is large enough
    AND d.id NOT IN (SELECT id FROM within_radius)  -- Don't duplicate
    -- ... conflict checks ...
)
-- Combine and order
SELECT id FROM (
  SELECT id, distance, 1 as priority FROM within_radius
  UNION ALL
  SELECT id, distance, 2 as priority FROM fallback_radius
) combined
ORDER BY priority ASC, distance ASC
LIMIT 1;
```

**Alternative Simpler Approach:** Use a single query with CASE in ORDER BY:
```sql
ORDER BY 
  -- Priority 1: Within radius (distance <= service_radius_km)
  CASE WHEN calculate_distance_km(...) <= COALESCE(d.service_radius_km, 50) THEN 1 ELSE 2 END,
  -- Then by distance
  calculate_distance_km(...) ASC,
  d.rating DESC
```

#### Step 0.2: Update `check_detailer_availability_in_radius()` Function

**Apply same fallback logic** to the availability check function so users see accurate availability (including fallback detailers).

**Note:** This ensures the frontend availability check matches the actual auto-assignment behavior.

---

### Phase 1: Availability Check API Integration

#### Step 1.1: Add Availability Check Function

**File:** `src/lib/bookings.ts`

**Add:**
```typescript
export interface CheckAvailabilityParams {
  bookingDate: string; // 'YYYY-MM-DD'
  bookingTimeStart: string; // 'HH:mm:ss'
  bookingLat: number;
  bookingLng: number;
  bookingTimeEnd?: string | null; // 'HH:mm:ss' (optional)
  serviceDurationMinutes?: number | null; // (optional, if end_time not provided)
  excludeOrgDetailers?: boolean; // (optional, default false)
}

export interface CheckAvailabilityResponse {
  available: boolean;
  detailer_count: number;
  nearest_distance_km: number | null;
  message?: string; // Only present if available=false
}

/**
 * Checks if detailers are available for a booking at the specified location and time.
 * This function calls the backend API to check availability before creating a booking.
 * 
 * @param params - Booking parameters including date, time, and location
 * @returns Availability check result with detailer count and nearest distance
 */
export async function checkBookingAvailability(
  params: CheckAvailabilityParams
): Promise<CheckAvailabilityResponse> {
  try {
    // Call Supabase RPC function (if available) or REST API endpoint
    const { data, error } = await supabase.rpc('check_detailer_availability_in_radius', {
      p_booking_date: params.bookingDate,
      p_booking_time_start: params.bookingTimeStart,
      p_booking_lat: params.bookingLat,
      p_booking_lng: params.bookingLng,
      p_booking_time_end: params.bookingTimeEnd ?? null,
      p_service_duration_minutes: params.serviceDurationMinutes ?? null,
      p_exclude_org_detailers: params.excludeOrgDetailers ?? false,
    });

    if (error) {
      console.error('check_detailer_availability_in_radius RPC error:', error);
      throw new Error(error.message || 'Failed to check availability');
    }

    if (!data) {
      throw new Error('No data returned from availability check');
    }

    return data as CheckAvailabilityResponse;
  } catch (error) {
    console.error('checkBookingAvailability error:', error);
    throw error;
  }
}
```

**Alternative:** If RPC function is not available, use REST API:
```typescript
// Fallback to REST API if RPC not available
const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_detailer_availability_in_radius`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
  },
  body: JSON.stringify({
    p_booking_date: params.bookingDate,
    p_booking_time_start: params.bookingTimeStart,
    p_booking_lat: params.bookingLat,
    p_booking_lng: params.bookingLng,
    p_booking_time_end: params.bookingTimeEnd ?? null,
    p_service_duration_minutes: params.serviceDurationMinutes ?? null,
    p_exclude_org_detailers: params.excludeOrgDetailers ?? false,
  }),
});
```

#### Step 1.2: Integrate Availability Check in Booking Flow

**File:** `src/screens/booking/CombinedSelectionScreen.tsx`

**Location:** In `proceedWithGeocode` function, after geocoding succeeds

**Add:**
```typescript
// After geocoding succeeds, check availability
if (shouldAttemptGeocode && geocodeResult) {
  // Check availability before proceeding
  try {
    setIsCheckingAvailability(true);
    
    // Format date as YYYY-MM-DD
    const bookingDate = selectedDateValue.toISOString().split('T')[0];
    
    // Format time as HH:mm:ss (convert from "9:30 AM" to "09:30:00")
    const time24 = convertTimeTo24Hour(selectedTime); // Need helper function
    
    // Get service duration from selectedService
    const serviceDuration = selectedService?.duration_minutes || null;
    
    const availability = await checkBookingAvailability({
      bookingDate,
      bookingTimeStart: time24,
      bookingLat: geocodeResult.latitude,
      bookingLng: geocodeResult.longitude,
      serviceDurationMinutes: serviceDuration,
    });
    
    setIsCheckingAvailability(false);
    
    if (!availability.available) {
      // Show "no detailer available" message
      setAvailabilityError(availability.message || 'No detailers available');
      setShowAvailabilityError(true);
      return; // Don't proceed to OrderSummary
    }
    
    // Availability check passed, proceed with booking
    finalizeSelection(normalizedProvince, normalizedPostalCode, {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
    });
    
  } catch (error) {
    setIsCheckingAvailability(false);
    console.error('Availability check failed:', error);
    // Optionally show error or proceed anyway (graceful degradation)
    // For now, proceed with booking (backend will handle it)
    finalizeSelection(normalizedProvince, normalizedPostalCode, {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
    });
  }
}
```

**Add state variables:**
```typescript
const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
const [availabilityError, setAvailabilityError] = useState<string | null>(null);
const [showAvailabilityError, setShowAvailabilityError] = useState(false);
```

**Add helper function:**
```typescript
// Convert "9:30 AM" to "09:30:00"
function convertTimeTo24Hour(timeStr: string): string {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours, 10);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
}
```

---

### Phase 2: "No Detailer Available" UI Component

#### Step 2.1: Create Availability Error Component

**File:** `src/components/AvailabilityErrorCard.tsx` (new file)

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvailabilityErrorCardProps {
  message: string;
  onTryDifferentTime?: () => void;
  onTryDifferentLocation?: () => void;
  onDismiss?: () => void;
}

export default function AvailabilityErrorCard({
  message,
  onTryDifferentTime,
  onTryDifferentLocation,
  onDismiss,
}: AvailabilityErrorCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="location-outline" size={48} color="#FF6B6B" />
      </View>
      <Text style={styles.title}>No Detailers Available</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        {onTryDifferentTime && (
          <TouchableOpacity style={styles.button} onPress={onTryDifferentTime}>
            <Ionicons name="time-outline" size={20} color="#007AFF" />
            <Text style={styles.buttonText}>Try Different Time</Text>
          </TouchableOpacity>
        )}
        {onTryDifferentLocation && (
          <TouchableOpacity style={styles.button} onPress={onTryDifferentLocation}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <Text style={styles.buttonText}>Try Different Location</Text>
          </TouchableOpacity>
        )}
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dismissText: {
    color: '#999',
    fontSize: 14,
  },
});
```

#### Step 2.2: Integrate Error Card in CombinedSelectionScreen

**File:** `src/screens/booking/CombinedSelectionScreen.tsx`

**Add import:**
```typescript
import AvailabilityErrorCard from '../../components/AvailabilityErrorCard';
```

**Add to render (after location section):**
```typescript
{showAvailabilityError && availabilityError && (
  <AvailabilityErrorCard
    message={availabilityError}
    onTryDifferentTime={() => {
      setShowAvailabilityError(false);
      setTimeDropdownOpen(true);
    }}
    onTryDifferentLocation={() => {
      setShowAvailabilityError(false);
      setLocationExpanded(true);
    }}
    onDismiss={() => {
      setShowAvailabilityError(false);
      setAvailabilityError(null);
    }}
  />
)}
```

---

### Phase 3: Detailer Onboarding - Location & Service Radius

#### Step 3.1: Update Detailer Type

**File:** `src/types/domain.ts`

**Update Detailer interface:**
```typescript
export interface Detailer {
  id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  years_experience: number;
  is_active: boolean;
  bio: string | null;
  specialties: string[] | null;
  // Phase 4 additions
  latitude?: number | null;
  longitude?: number | null;
  service_radius_km?: number | null;
}
```

#### Step 3.2: Find Detailer Onboarding Screen

**Search for:** Detailer signup/onboarding screen

**If exists, add location step:**
- Home base address input (with autocomplete)
- Geocode to get lat/lng
- Service radius slider/input (1-200 km, default 50)
- Validation: radius must be 1-200 km

**If doesn't exist, create:** `src/screens/detailers/DetailerOnboardingScreen.tsx`

#### Step 3.3: Update create_detailer_profile RPC Call

**Find where detailer profile is created** (likely in detailer onboarding or profile screen)

**Update to include location:**
```typescript
const { data, error } = await supabase.rpc('create_detailer_profile', {
  p_full_name: fullName,
  p_years_experience: yearsExperience,
  p_avatar_url: avatarUrl,
  // Phase 4 additions
  p_latitude: latitude,
  p_longitude: longitude,
  p_service_radius_km: serviceRadiusKm,
});
```

**⚠️ IMPORTANT:** The current `create_detailer_profile` RPC function does NOT accept location parameters. Two options:
1. **Update backend RPC function** to accept `p_latitude`, `p_longitude`, `p_service_radius_km` parameters
2. **Use separate update call** after creation:
   ```typescript
   // Create detailer profile first
   const { data: detailer } = await supabase.rpc('create_detailer_profile', {
     p_full_name: fullName,
     p_years_experience: yearsExperience,
     p_avatar_url: avatarUrl,
   });
   
   // Then update location directly via Supabase client
   await supabase
     .from('detailers')
     .update({
       latitude: latitude,
       longitude: longitude,
       service_radius_km: serviceRadiusKm,
     })
     .eq('id', detailer.id);
   ```

---

### Phase 4: Detailer Profile Updates

#### Step 4.1: Find Detailer Profile Edit Screen

**Search for:** Detailer profile edit/update screen

**Add fields:**
- Home base address (editable, with geocoding)
- Service radius input (1-200 km)
- Display current location on map (optional)

#### Step 4.2: Update update_detailer_profile RPC Call

**Add location parameters:**
```typescript
const { data, error } = await supabase.rpc('update_detailer_profile', {
  p_detailer_id: detailerId,
  p_full_name: fullName,
  p_years_experience: yearsExperience,
  p_avatar_url: avatarUrl,
  // Phase 4 additions
  p_latitude: latitude,
  p_longitude: longitude,
  p_service_radius_km: serviceRadiusKm,
});
```

**⚠️ IMPORTANT:** The current `update_detailer_profile` RPC function does NOT accept location parameters. Two options:
1. **Update backend RPC function** to accept `p_latitude`, `p_longitude`, `p_service_radius_km` parameters
2. **Use direct Supabase update**:
   ```typescript
   await supabase
     .from('detailers')
     .update({
       latitude: latitude,
       longitude: longitude,
       service_radius_km: serviceRadiusKm,
     })
     .eq('id', detailerId);
   ```

---

### Phase 5: Testing & Validation

#### Test Cases

1. **Availability Check - Available**
   - ✅ Select date/time/location with detailers nearby
   - ✅ Should proceed to OrderSummary
   - ✅ Should show no error

2. **Availability Check - Not Available**
   - ✅ Select date/time/location with no detailers nearby
   - ✅ Should show "No Detailer Available" message
   - ✅ Should not proceed to OrderSummary
   - ✅ "Try Different Time" should open time picker
   - ✅ "Try Different Location" should expand location section

3. **Booking Creation with Coordinates**
   - ✅ Verify lat/lng are passed to `createBooking()`
   - ✅ Verify backend receives coordinates
   - ✅ Verify detailer assignment respects radius

4. **Detailer Onboarding**
   - ✅ Create detailer profile with location
   - ✅ Set service radius (1-200 km)
   - ✅ Verify location saved in database

5. **Detailer Profile Update**
   - ✅ Update location
   - ✅ Update service radius
   - ✅ Verify changes saved

6. **Edge Cases**
   - ✅ No geocoding available (skip availability check gracefully)
   - ✅ Availability check fails (proceed with booking, backend handles)
   - ✅ Invalid coordinates
   - ✅ Service radius validation (1-200 km)

---

## Implementation Order

**⚠️ IMPORTANT:** Backend enhancement must be completed first!

0. ✅ **Phase 0:** Backend enhancement - Add fallback radius logic to `find_available_detailer()` and `check_detailer_availability_in_radius()`
1. ✅ **Phase 1.1:** Add `checkBookingAvailability()` function
2. ✅ **Phase 1.2:** Integrate availability check in booking flow
3. ✅ **Phase 2:** Create and integrate "No Detailer Available" UI
4. ✅ **Phase 3:** Add location/radius to detailer onboarding
5. ✅ **Phase 4:** Add location/radius to detailer profile updates
6. ✅ **Phase 5:** Testing and validation

---

## Files to Modify

### New Files
- `src/components/AvailabilityErrorCard.tsx` - Error message component
- `src/screens/detailers/DetailerOnboardingScreen.tsx` - (if doesn't exist)

### Modified Files
- `src/lib/bookings.ts` - Add `checkBookingAvailability()` function
- `src/screens/booking/CombinedSelectionScreen.tsx` - Integrate availability check
- `src/types/domain.ts` - Update `Detailer` interface
- Detailer onboarding/profile screens - Add location/radius fields

---

## Dependencies

- ✅ Google Maps API (already configured)
- ⚠️ **REQUIRED:** Backend enhancement - Fallback radius logic in `find_available_detailer()` and `check_detailer_availability_in_radius()`
- ✅ Supabase RPC function `check_detailer_availability_in_radius` (backend - needs enhancement)
- ✅ Backend API endpoint `/api/bookings/check-availability` (backend - needs enhancement)

---

## Notes

1. **Graceful Degradation:** If availability check fails, proceed with booking creation. Backend will handle availability during auto-assignment.

2. **Service Duration:** Need to get service duration from `selectedService` in `CombinedSelectionScreen`. If not available, use default or calculate from time slots.

3. **Time Format:** Need helper function to convert "9:30 AM" format to "09:30:00" format for API.

4. **Backend RPC vs REST:** 
   - Check if `check_detailer_availability_in_radius` is available as RPC function in Supabase
   - If RPC exists, use `supabase.rpc('check_detailer_availability_in_radius', {...})`
   - If RPC doesn't exist, use REST API endpoint: `POST /api/bookings/check-availability`
   - The backend guide mentions both RPC function and REST endpoint - verify which is available

5. **Detailer Onboarding:** 
   - Current `create_detailer_profile` RPC does NOT accept location parameters
   - Options: (1) Update backend RPC function, or (2) Use direct Supabase update after creation
   - Recommend option 2 for faster implementation (no backend migration needed)
   
6. **Backend Migration Needed:**
   - If using RPC for availability check, verify migration exists: `add_check_detailer_availability_function`
   - If updating RPC functions for location, create new migration to add parameters

---

## Success Criteria

- ✅ Backend uses two-tier matching: (1) detailers within radius, (2) detailers with larger radius as fallback
- ✅ Users see "No Detailer Available" message when no detailers available (including fallback)
- ✅ Users can try different time/location from error message
- ✅ Booking creation includes lat/lng coordinates
- ✅ Auto-assignment prioritizes local detailers, then falls back to detailers with larger service radii
- ✅ Detailers can set their location and service radius during onboarding
- ✅ Detailers can update their location and service radius in profile
- ✅ Backend filters detailers by service radius correctly with fallback logic

---

## Next Steps

1. Review this plan with team
2. Start with Phase 1 (Availability Check API)
3. Test each phase before moving to next
4. Update backend RPC functions if needed for detailer location updates

