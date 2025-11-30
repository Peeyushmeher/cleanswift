# Address Verification Implementation Notes

**Date:** 2025-01-18  
**Status:** Analysis Complete - Implementation In Progress

---

## 1. Current Implementation Analysis

### 1.1 Location Screen

**File:** `src/screens/booking/CombinedSelectionScreen.tsx`

**Current Fields:**
- Street Address (`address_line1`) - TextInput, no validation
- City (`city`) - TextInput, no validation
- Province (`province`) - TextInput, no validation
- Postal Code (`postal_code`) - TextInput, no validation
- Special Instructions (`location_notes`) - Optional TextArea

**Current Validation:**
- Only checks if fields are non-empty (lines 82-90)
- No format validation
- No geocoding/verification
- Users can enter any text (e.g., "43fefgf Dead sad")

**UI Style:**
- Dark theme (`#050B12` background, `#0A1A2F` cards)
- Rounded inputs (12px border radius)
- Blue CTA button (`#1DA4F3`)
- Consistent with existing design system

### 1.2 Data Flow

**Location Data Storage:**
1. **Local State** (`CombinedSelectionScreen.tsx`):
   - `locationData` state (lines 53-60)
   - Stores partial `BookingLocation` object

2. **BookingContext** (`src/contexts/BookingContext.tsx`):
   - `selectedLocation: BookingLocation | null` (line 72)
   - `setLocation` function (line 81, implemented line 141-143)
   - Type definition: `BookingLocation` interface (lines 53-62)

3. **Booking Creation** (`src/services/paymentService.ts`):
   - `createBooking` function accepts location fields (lines 133-152)
   - Passes to Supabase `bookings` table insert (lines 170-177)

### 1.3 Database Schema

**Table:** `bookings` (from `supabase/migrations/20250118000000_initial_schema.sql`)

**Location Fields:**
- `address_line1` (text NOT NULL) - Primary address
- `address_line2` (text, nullable) - Secondary address line
- `city` (text NOT NULL) - City
- `province` (text NOT NULL) - Province/State
- `postal_code` (text NOT NULL) - Postal/ZIP code
- `latitude` (numeric(10,7), nullable) - GPS latitude ✅ **Available for geocoding**
- `longitude` (numeric(10,7), nullable) - GPS longitude ✅ **Available for geocoding**
- `location_notes` (text, nullable) - Additional location instructions

**Current Usage:**
- `PaymentMethodScreen.tsx` passes `selectedLocation` from context to `createBooking` (lines 137-144)
- `latitude` and `longitude` are currently set to `null` in `CombinedSelectionScreen` (lines 105-106)

---

## 2. Implementation Plan

### 2.1 Client-Side Validation Rules

**Street Address:**
- Must contain at least one number and one letter
- Minimum length: 5 characters
- Pattern: `/.*\d.*[a-zA-Z].*|.*[a-zA-Z].*\d.*/`

**City:**
- Letters + spaces only
- Minimum length: 2 characters
- Pattern: `/^[a-zA-Z\s]+$/`

**Province:**
- Letters only (Canadian provinces: 2-letter codes)
- Length: 2 characters
- Pattern: `/^[A-Z]{2}$/` (normalize to uppercase)

**Postal Code (Canadian):**
- Format: `A1A 1A1` (letter-digit-letter space digit-letter-digit)
- Pattern: `/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/`
- Normalize: Add space in middle if missing, uppercase letters

### 2.2 Geocoding Service Integration

**Service:** Google Maps Geocoding API + Places Autocomplete API

**Environment Variable:**
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (to be set by user)

**Implementation Approach:**
1. **Autocomplete (Preferred):**
   - As user types in Street Address (≥3 chars, debounced)
   - Call Places Autocomplete API
   - Show dropdown suggestions
   - On selection, call Place Details API to get full address components + lat/lng

2. **Geocode on Submit (Fallback):**
   - If autocomplete not selected, validate format
   - On "Continue to Review" button press
   - Build full address string: `{street}, {city}, {province} {postal_code}, Canada`
   - Call Geocoding API
   - Validate result confidence
   - Extract normalized address + lat/lng

### 2.3 New Files to Create

1. **`src/services/googleGeocoding.ts`**
   - `geocodeAddress(address: string): Promise<GeocodeResult>`
   - `getPlaceDetails(placeId: string): Promise<PlaceDetailsResult>`
   - `autocompletePlaces(input: string, region?: string): Promise<AutocompleteResult[]>`

2. **`src/hooks/useAddressAutocomplete.ts`**
   - Hook for managing autocomplete state
   - Debounced API calls
   - Suggestion list management

3. **`src/utils/addressValidation.ts`**
   - `validateStreetAddress(address: string): ValidationResult`
   - `validateCity(city: string): ValidationResult`
   - `validateProvince(province: string): ValidationResult`
   - `validatePostalCode(postalCode: string): ValidationResult`
   - `normalizePostalCode(postalCode: string): string`

### 2.4 Modified Files

1. **`src/screens/booking/CombinedSelectionScreen.tsx`**
   - Add validation state for each field
   - Add autocomplete UI (dropdown suggestions)
   - Add geocoding on submit
   - Show validation errors inline
   - Update `handleContinue` to validate + geocode before proceeding

---

## 3. Assumptions & Future Recommendations

### 3.1 Current Assumptions

1. **Country:** Canada (postal code format, province codes)
2. **API Key:** User will add `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env` or Expo config
3. **No Schema Changes:** Using existing `latitude`/`longitude` columns in `bookings` table
4. **UI Consistency:** Maintain existing dark theme, rounded inputs, blue CTA

### 3.2 Future Recommendations

1. **User Saved Addresses:**
   - Consider adding `saved_addresses` table for users
   - Allow users to select from previously used addresses

2. **Service Area Validation:**
   - Check if address is within service area
   - Filter detailers by proximity if location data available

3. **Map Picker:**
   - Optional map view to visually select location
   - Useful for precise location selection

4. **Address History:**
   - Store normalized addresses in a separate table
   - Reduce API calls for repeated addresses

---

## 4. Implementation Status

- [x] Analysis complete
- [ ] Client-side validation implemented
- [ ] Google Geocoding service created
- [ ] Autocomplete hook created
- [ ] UI updated with suggestions dropdown
- [ ] Geocode-on-submit implemented
- [ ] Error handling & user feedback
- [ ] Testing & validation

---

## 5. Environment Variables Required

**Required:**
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key with Geocoding API and Places API enabled

**Setup Instructions:**
1. Get API key from Google Cloud Console
2. Enable "Geocoding API" and "Places API" for the key
3. Add to `.env` file: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`
4. Restart Expo dev server

