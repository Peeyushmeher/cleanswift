# Combined Selection Screen - Analysis & Implementation Notes

**Date:** 2025-01-18  
**Status:** Analysis Complete - Ready for Implementation

---

## 1. Database Schema Analysis

### 1.1 Bookings Table Structure

The `bookings` table (from `supabase/migrations/20250118000000_initial_schema.sql`) stores:

**Location Fields:**
- `address_line1` (text NOT NULL) - Primary address
- `address_line2` (text, nullable) - Secondary address line
- `city` (text NOT NULL) - City
- `province` (text NOT NULL) - Province/State
- `postal_code` (text NOT NULL) - Postal/ZIP code
- `latitude` (numeric(10,7), nullable) - GPS latitude
- `longitude` (numeric(10,7), nullable) - GPS longitude
- `location_notes` (text, nullable) - Additional location instructions

**Time/Date Fields:**
- `scheduled_date` (date NOT NULL) - Booking date
- `scheduled_time_start` (time NOT NULL) - Start time
- `scheduled_time_end` (time, nullable) - End time (not currently set)

**Relationships:**
- `detailer_id` (uuid, nullable) - References `detailers.id` ON DELETE SET NULL
- `service_id` (uuid NOT NULL) - References `services.id`
- `car_id` (uuid NOT NULL) - References `cars.id`
- `user_id` (uuid NOT NULL) - References `profiles.id`

### 1.2 Detailers Table Structure

The `detailers` table stores:
- `id` (uuid PRIMARY KEY)
- `full_name` (text NOT NULL)
- `rating` (numeric(3,2))
- `review_count` (integer)
- `years_experience` (integer)
- `is_active` (boolean)

**Note:** No location/coverage area fields exist. Currently, all active detailers are shown without geographic filtering.

### 1.3 Profiles Table Structure

The `profiles` table does **NOT** have address fields. User addresses are only stored in the `bookings` table per booking.

**Current Limitation:** No default/saved address for users. Each booking requires address entry.

---

## 2. Current Booking Flow

### 2.1 Navigation Flow

```
ServiceSelection 
  → BookingDateTime (select date & time)
    → ChooseDetailer (select detailer)
      → OrderSummary (review)
        → PaymentMethod (payment)
```

### 2.2 Data Storage Pattern

**BookingContext** (`src/contexts/BookingContext.tsx`) stores:
- `selectedService`: Service object
- `selectedAddons`: Array of ServiceAddon objects
- `selectedCar`: Car object
- `selectedDate`: Date object
- `selectedTimeSlot`: string (e.g., "9:30 AM")
- `selectedDetailer`: Detailer object
- `priceBreakdown`: PriceBreakdown object

**Missing from Context:**
- Location/Address data (currently hardcoded in PaymentMethodScreen)

**Navigation Params:**
- Route params pass IDs for backward compatibility
- Primary data source is BookingContext

### 2.3 Current Location Handling

**Location is NOT selected in the booking flow.** It's hardcoded in `PaymentMethodScreen.tsx`:

```typescript
address_line1: 'Customer address TBD', // TODO: get from user profile
city: 'Toronto', // TODO: get from user profile
province: 'ON', // TODO: get from user profile
postal_code: 'M1M 1M1', // TODO: get from user profile
latitude: null,
longitude: null,
```

---

## 3. Existing Screens & Components

### 3.1 ChooseDetailerScreen (`src/screens/booking/ChooseDetailerScreen.tsx`)

**Features:**
- Lists all active detailers from Supabase
- Shows: name, rating, review count, years experience
- Displays placeholder for distance/ETA (not implemented)
- Uses `useDetailers()` hook
- Selection: Radio-style selection with checkmark
- Updates BookingContext via `setDetailer()`

**Design Elements:**
- Card style: `#0A1A2F` background, 24px border radius
- Selected: 2px border `#6FF0C4` with shadow
- Avatar: Circular with initials
- Rating: Star icon + number + review count

### 3.2 BookingDateTimeScreen (`src/screens/booking/BookingDateTimeScreen.tsx`)

**Features:**
- Hardcoded date list (7 days) with availability flags
- Hardcoded time slots (8:00 AM - 8:00 PM) with availability flags
- Horizontal scroll for dates
- Grid layout for time slots
- Selection: Radio-style selection
- Updates BookingContext via `setDateTime(date, timeSlot)`

**Design Elements:**
- Date cards: 80px wide, horizontal scroll
- Time cards: 48% width grid (2 columns)
- Selected: 2px border `#6FF0C4` with shadow
- Disabled: Reduced opacity (0.4)

### 3.3 OrderSummaryScreen (`src/screens/booking/OrderSummaryScreen.tsx`)

**Features:**
- Reads all selections from BookingContext
- Displays: Service, Car, Detailer, Date/Time, Price Breakdown
- Each section has "Change" link to edit
- No location section shown (not in context)

---

## 4. Design System

### 4.1 Color Palette

- **Background:** `#050B12` (dark navy)
- **Cards:** `#0A1A2F` (slightly lighter navy)
- **Primary Accent:** `#6FF0C4` (cyan-green)
- **Secondary Accent:** `#1DA4F3` (blue)
- **Text Primary:** `#F5F7FA` (white)
- **Text Secondary:** `#C6CFD9` (gray)
- **Border Default:** `rgba(255,255,255,0.05)`
- **Border Selected:** `#6FF0C4`

### 4.2 Typography

- **Header Title:** 28px, fontWeight 600
- **Section Title:** 18px, fontWeight 600
- **Card Title:** 18px, fontWeight 600
- **Body Text:** 16px, fontWeight 500
- **Secondary Text:** 14px
- **Small Text:** 12px

### 4.3 Spacing & Layout

- **Padding:** 24px horizontal
- **Card Padding:** 24px
- **Card Border Radius:** 24px
- **Section Margin Bottom:** 32px
- **Element Margin Bottom:** 16px (cards), 12px (small items)
- **Button Height:** 56px min
- **Button Border Radius:** 24px

### 4.4 Component Patterns

- **Cards:** `backgroundColor: '#0A1A2F'`, `borderRadius: 24`, `padding: 24`, `borderWidth: 1`, `borderColor: 'rgba(255,255,255,0.05)'`
- **Selected State:** `borderWidth: 2`, `borderColor: '#6FF0C4'`, shadow with `#6FF0C4`
- **Disabled State:** `opacity: 0.4`
- **Buttons:** `backgroundColor: '#1DA4F3'`, shadow, `borderRadius: 24`
- **Icons:** Ionicons from `@expo/vector-icons`

---

## 5. Availability Logic

### 5.1 Current Implementation

**Detailers:**
- No availability logic exists
- All active detailers shown (`is_active = true`)
- No filtering by time, date, or location

**Time Slots:**
- Hardcoded availability flags in BookingDateTimeScreen
- No backend validation
- No conflict checking with existing bookings

**Location:**
- Not implemented
- No geographic filtering

### 5.2 Assumptions for Combined Screen

For initial implementation:
- **Detailers:** Show all active detailers (no filtering yet)
- **Time Slots:** Use same hardcoded list (can be enhanced later)
- **Location:** Simple text input or basic selection (no geocoding initially)

---

## 6. Implementation Plan

### 6.1 Files to Create

1. `src/screens/booking/CombinedSelectionScreen.tsx` - New combined screen
2. `docs/combined_selection_notes.md` - This document

### 6.2 Files to Modify

1. `src/contexts/BookingContext.tsx` - Add location state
2. `src/navigation/BookingStack.tsx` - Add CombinedSelectionScreen route
3. `src/screens/booking/ServiceSelectionScreen.tsx` - Optionally navigate to CombinedSelectionScreen
4. `src/screens/booking/OrderSummaryScreen.tsx` - Display location from context
5. `src/screens/booking/PaymentMethodScreen.tsx` - Use location from context instead of hardcoded

### 6.3 Data Flow

**CombinedSelectionScreen:**
1. User selects priority (Detailer/Time/Location)
2. User fills selections based on priority
3. Updates BookingContext: `setDetailer()`, `setDateTime()`, `setLocation()`
4. Navigate to OrderSummary

**OrderSummaryScreen:**
1. Reads from BookingContext (including location)
2. Displays all selections including location

**PaymentMethodScreen:**
1. Reads location from BookingContext
2. Passes location to `createBooking()`

---

## 7. Navigation Integration

### 7.1 Current Flow

```
ServiceSelection → BookingDateTime → ChooseDetailer → OrderSummary
```

### 7.2 Proposed Flow (Alternative)

```
ServiceSelection → CombinedSelectionScreen → OrderSummary
```

**Implementation Strategy:**
- Add CombinedSelectionScreen as alternative route
- ServiceSelection can navigate to either:
  - `BookingDateTime` (existing multi-step flow)
  - `CombinedSelectionScreen` (new combined flow)
- User choice or feature flag can determine which flow

**For MVP:** Replace `BookingDateTime` and `ChooseDetailer` with `CombinedSelectionScreen`

---

## 8. Location Data Structure

### 8.1 Location Type

```typescript
interface BookingLocation {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  province: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  location_notes?: string | null;
}
```

### 8.2 Initial Implementation

**Phase 1 (MVP):**
- Simple text input for address_line1
- Dropdown or text input for city, province, postal_code
- No geocoding (latitude/longitude can be null)

**Phase 2 (Future):**
- Address autocomplete (Google Places API)
- Geolocation (user's current location)
- Map picker
- Geocoding (convert address to lat/lng)

---

## 9. Priority Modes

### 9.1 Detailer-First Mode

**Flow:**
1. Show detailer list
2. User selects detailer
3. Show available time slots (filtered if needed)
4. User selects time
5. Show location input
6. User enters location

### 9.2 Time-First Mode

**Flow:**
1. Show date & time picker
2. User selects date & time
3. Show detailers (filtered if needed)
4. User selects detailer
5. Show location input
6. User enters location

### 9.3 Location-First Mode

**Flow:**
1. Show location input
2. User enters location
3. Show detailers (filtered if needed)
4. User selects detailer
5. Show available time slots (filtered if needed)
6. User selects time

---

## 10. Testing Checklist

- [ ] CombinedSelectionScreen renders correctly
- [ ] Priority selector works (Detailer/Time/Location)
- [ ] Detailer selection updates BookingContext
- [ ] Date/time selection updates BookingContext
- [ ] Location input updates BookingContext
- [ ] Continue button disabled until all 3 selected
- [ ] Navigation to OrderSummary works
- [ ] OrderSummary displays location
- [ ] PaymentMethodScreen uses location from context
- [ ] Booking creation includes location data
- [ ] Design matches existing design system

---

**Status:** Analysis complete. Ready for implementation.

---

## 11. Implementation Summary

### 11.1 Files Created

1. **`src/screens/booking/CombinedSelectionScreen.tsx`**
   - New combined selection screen (900+ lines)
   - Implements priority-based selection (Detailer/Time/Location)
   - Reuses existing design patterns from ChooseDetailerScreen and BookingDateTimeScreen
   - Includes location input form
   - Shows summary bar at bottom with all selections

2. **`docs/combined_selection_notes.md`**
   - This analysis document

### 11.2 Files Modified

1. **`src/contexts/BookingContext.tsx`**
   - Added `BookingLocation` interface
   - Added `selectedLocation: BookingLocation | null` state
   - Added `setLocation()` action
   - Updated `clearBooking()` to reset location
   - Exported `BookingLocation` type

2. **`src/navigation/BookingStack.tsx`**
   - Added `CombinedSelection` route to `BookingStackParamList`
   - Added `<Stack.Screen name="CombinedSelection" component={CombinedSelectionScreen} />`
   - Added comment explaining CombinedSelectionScreen purpose

3. **`src/screens/booking/ServiceSelectionScreen.tsx`**
   - Changed navigation from `BookingDateTime` to `CombinedSelection`
   - Now navigates directly to combined flow

4. **`src/screens/booking/OrderSummaryScreen.tsx`**
   - Added `selectedLocation` from BookingContext
   - Added Location Card section to display location
   - Updated "Change" links to navigate to `CombinedSelection`

5. **`src/screens/booking/PaymentMethodScreen.tsx`**
   - Added `selectedLocation` from BookingContext
   - Updated validation to require location
   - Replaced hardcoded address with `selectedLocation` from context
   - All location fields now come from BookingContext

---

## 12. Navigation Flow

### 12.1 Updated Flow

**Previous Flow:**
```
ServiceSelection → BookingDateTime → ChooseDetailer → OrderSummary → PaymentMethod
```

**New Flow:**
```
ServiceSelection → CombinedSelection → OrderSummary → PaymentMethod
```

### 12.2 How to Test

1. **Start the app** and navigate to Book tab
2. **Select a service** in ServiceSelectionScreen
3. **Continue** - you'll be taken to CombinedSelectionScreen
4. **Choose priority** (Detailer/Time/Location)
5. **Fill selections** based on priority order
6. **Continue** - navigates to OrderSummaryScreen
7. **Verify** all selections (Service, Detailer, Date/Time, Location) are displayed
8. **Continue to Payment** - location should be included in booking creation

### 12.3 Data Flow

**CombinedSelectionScreen:**
- Reads existing selections from BookingContext (if any)
- Updates BookingContext with new selections:
  - `setDetailer(detailer)`
  - `setDateTime(date, timeSlot)`
  - `setLocation(location)`
- Navigates to OrderSummary with route params (for backward compatibility)

**OrderSummaryScreen:**
- Reads all selections from BookingContext
- Displays: Service, Car, Detailer, Date/Time, Location
- "Change" links navigate back to CombinedSelection

**PaymentMethodScreen:**
- Reads all selections from BookingContext
- Uses `selectedLocation` to create booking
- Passes location data to `createBooking()` function

---

## 13. Design Implementation

### 13.1 Priority Selector

- **Design:** Three pill buttons in a row
- **Colors:** Unselected - `#0A1A2F` background, Selected - `#6FF0C4` border
- **Position:** Below header, above scrollable content
- **Behavior:** Switching priority shows different view order

### 13.2 Location Input

- **Design:** Card with text inputs matching existing form style
- **Fields:** Address Line 1, City, Province, Postal Code, Notes (optional)
- **Validation:** Required fields (Address, City, Province, Postal Code)
- **Future:** Can be enhanced with geocoding, autocomplete, map picker

### 13.3 Summary Bar

- **Design:** Sticky bottom bar with summary rows
- **Shows:** Detailer name, Date/Time, Location (short format)
- **Position:** Fixed at bottom, above continue button
- **Updates:** Real-time as selections are made

---

## 14. Testing Checklist

- [x] CombinedSelectionScreen renders correctly
- [x] Priority selector works (Detailer/Time/Location)
- [x] Detailer selection updates BookingContext
- [x] Date/time selection updates BookingContext
- [x] Location input updates BookingContext
- [x] Continue button disabled until all 3 selected
- [x] Navigation to OrderSummary works
- [x] OrderSummary displays location
- [x] PaymentMethodScreen uses location from context
- [x] Booking creation includes location data
- [x] Design matches existing design system
- [x] No TypeScript errors
- [x] No linter errors

---

## 15. Known Limitations & Future Enhancements

### 15.1 Current Limitations

1. **No Availability Logic:**
   - Detailers shown regardless of time/date/location
   - Time slots are hardcoded (no backend validation)
   - No conflict checking with existing bookings

2. **Basic Location Input:**
   - Simple text inputs (no autocomplete)
   - No geocoding (latitude/longitude always null)
   - No map picker
   - No saved addresses

3. **Priority Modes:**
   - All modes show same options (just reordered)
   - No actual filtering based on priority

### 15.2 Future Enhancements

1. **Availability System:**
   - Backend availability checking
   - Filter detailers by time/location
   - Real-time slot availability

2. **Location Features:**
   - Google Places autocomplete
   - Geolocation (current location)
   - Map picker
   - Geocoding (address → lat/lng)
   - Saved addresses

3. **Priority Modes:**
   - Dynamic filtering based on priority
   - Show only available options based on previous selections

---

**Status:** ✅ Implementation complete and tested. All tasks completed.

