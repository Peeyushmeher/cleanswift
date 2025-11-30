# Detailer Profiles & Rebook Notes

## 1.1 Detailer data model
- **Tables:** `detailers` holds stylist-specific attributes and `bookings.detailer_id` is a nullable FK pointing to `detailers.id`. Extra review data also exists through the `reviews` table (`reviews.detailer_id`).
- **Detailer fields available today:** `full_name`, `avatar_url`, `rating` (0–5 numeric), `review_count`, `years_experience`, `is_active`, plus `created_at/updated_at`. These map 1:1 with the `Detailer` type exported from `BookingContext`.
- **Useful UI data:** 
  - Hero info: `full_name`, initials derived from it, optional `avatar_url`.
  - Credibility: `rating` + `review_count`.
  - Experience: `years_experience`.
  - Availability/active status: `is_active` (already filtered in `useDetailers`).
  - Metadata from related tables when needed: `reviews` can provide user quotes later, `bookings` provides historical counts, but no bio/service-area columns exist yet.
- **Booking linkage:** `bookings.detailer_id` is what ties a reservation to a specific detailer; `booking_addons` and other booking columns continue to describe the rest of the order. Rebooking flows should reuse the stored `detailer_id` together with `service_id`, `car_id`, and address fields already present on the booking row.

## 1.2 Screens/components where a user chooses a detailer
- `src/screens/booking/ChooseDetailerScreen.tsx`
  - Triggered after the dedicated `BookingDateTime` flow; receives `selectedService`, `selectedAddons`, `date`, and `time` via `BookingStack` params.
  - Pulls active detailers via `useDetailers()`, renders each as a full-width card (`TouchableOpacity`) with rating, review count, and experience pill.
  - Props/state: `selectedDetailerId` local state drives selection UI; `handleContinue` looks up the chosen detailer and saves it through `BookingContext.setDetailer`.
- `src/screens/booking/CombinedSelectionScreen.tsx`
  - Used by default from `ServiceSelection` to orchestrate detailer selection, date/time, and location on a single screen.
  - Imports `useDetailers` and keeps `selectedDetailerId` plus other booking state. Selected detailer summary appears at the top of the card; the list renders compact `TouchableOpacity` rows with initials, rating, and review count.
  - When `handleContinue` runs it resolves the chosen detailer from the fetched list, stores it in `BookingContext`, and proceeds to `OrderSummary`.
- There is no standalone `DetailerCard` component yet; both screens define their own card styles inline, so the planned info-icon/profile modal will need to slot into these existing layouts and accept callbacks (`onPress` vs `onPressInfo`) to avoid accidental selection.

## 1.3 Orders / past bookings entry points
- `src/screens/orders/OrdersHistoryScreen.tsx`
  - Currently renders placeholder booking data but already shows the intended card layout (service name, vehicle, date, price, status dot) and navigates to `OrderDetails` on press.
  - Each row should eventually be backed by the `bookings` table, giving us `id`, `service_id`, `detailer_id`, `car_id`, schedule info, address fields, status, and price/tax totals.
  - Rebooking button logic will live here (and anywhere else bookings are listed) once real data is wired up, gated by `status === 'completed'` and `detailer_id` not null.
- `src/screens/orders/OrderDetailsScreen.tsx`
  - Displays a static snapshot of one booking (service summary, car, detailer info, payment breakdown) and is an obvious secondary location for a “book again” action because it already has context for the referenced booking.
- **How to access booking data:** when querying Supabase, use `bookings` filtered by the current user (`user_id = profile.id`), selecting the columns needed for rebooking: `detailer_id`, `service_id`, `car_id`, `address_line1/line2/city/province/postal_code`, `location_notes`, plus schedule + totals for display. This keeps all prefill inputs derived from existing schema without introducing new tables or Stripe changes.

## 2. Detailer profile card implementation snapshot
- **Files:** `src/components/DetailerProfileCard.tsx` (new modal card), `src/screens/booking/ChooseDetailerScreen.tsx`, and `src/screens/booking/CombinedSelectionScreen.tsx` (info icon wiring/state), plus `docs` notes.
- **Fields surfaced:** `detailers.full_name`, `avatar_url`, `rating`, `review_count`, `years_experience`, and the currently selected service (`services.name`/`price`) to show contextual “popular for” info. All data originates from the existing `detailers` and `services` tables via the `useDetailers` hook + `BookingContext`.
- **Usage:** tapping the info icon opens the modal without changing selection; the modal exposes a dedicated CTA that simply sets the same `selectedDetailerId` state the list uses, so booking logic/Stripe flow remain untouched.

## 3. “Book again with this detailer” flow
- **Files:** `src/hooks/useBookings.ts` (fetches user bookings + joins), `src/screens/orders/OrdersHistoryScreen.tsx`, `src/screens/orders/OrderDetailsScreen.tsx`, `src/navigation/BookingStack.tsx`, and `src/screens/booking/ServiceSelectionScreen.tsx` (route param + banner handling).
- **Buttons live on:** each completed booking card in `OrdersHistoryScreen` and the detailer card within `OrderDetailsScreen`. Visibility is gated by `booking.status === 'completed'` and a non-null `detailer_id`.
- **Navigation:** both entry points route through the Book tab via `navigation.navigate('Book', { screen: 'ServiceSelection', params: { rebookFromBookingId } })`, ensuring we always start the canonical booking stack.
- **Prefill behavior:** before navigation we call `clearBooking()` then rehydrate `BookingContext` with `service`, `car`, `detailer`, and `location` straight from the `bookings` record. Date/time are intentionally left empty so the user must pick a new slot. Add-ons are reset for now because `booking_addons` data isn’t surfaced yet.
- **Assumptions & future ideas:** we assume the referenced service and car IDs are still valid (active) when rebooking. A future enhancement could hydrate add-ons via a join to `booking_addons`/`service_addons`, and surface richer detailer metadata (bios, service areas) once the schema grows.


