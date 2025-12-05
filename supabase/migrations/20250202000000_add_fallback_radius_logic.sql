-- ============================================================================
-- Add Fallback Radius Logic to Detailer Matching
-- ============================================================================
-- This migration enhances the detailer matching logic to use a two-tier approach:
-- 1. First pass: Match detailers where distance <= service_radius_km (within their set radius)
-- 2. Second pass: Match detailers where service_radius_km >= distance (their radius covers the booking)
-- This ensures local detailers are prioritized, but falls back to detailers with larger service radii
-- when no local detailers are available.
-- ============================================================================

-- Update find_available_detailer function with fallback logic
CREATE OR REPLACE FUNCTION find_available_detailer(
  p_booking_date date,
  p_booking_time_start time,
  p_booking_time_end time DEFAULT NULL,
  p_service_duration_minutes integer DEFAULT NULL,
  p_booking_lat numeric DEFAULT NULL,
  p_booking_lng numeric DEFAULT NULL,
  p_exclude_org_detailers boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  booking_day_of_week integer;
  calculated_end_time time;
  booking_start_time time;
  booking_end_time time;
  available_detailer_id uuid;
  booking_distance numeric;
BEGIN
  -- 1) Calculate day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  booking_day_of_week := EXTRACT(DOW FROM p_booking_date)::integer;

  -- 2) Calculate end time if not provided
  IF p_booking_time_end IS NULL THEN
    IF p_service_duration_minutes IS NULL THEN
      RAISE EXCEPTION 'Either booking_time_end or service_duration_minutes must be provided';
    END IF;
    calculated_end_time := (p_booking_time_start + (p_service_duration_minutes || ' minutes')::interval)::time;
  ELSE
    calculated_end_time := p_booking_time_end;
  END IF;

  booking_start_time := p_booking_time_start;
  booking_end_time := calculated_end_time;

  -- 3) Validate end time > start time
  IF booking_end_time <= booking_start_time THEN
    RAISE EXCEPTION 'Booking end time must be after start time';
  END IF;

  -- 4) Find available detailer with fallback logic
  -- Two-tier matching:
  -- - Priority 1: Detailers where distance <= service_radius_km (within their set radius)
  -- - Priority 2: Detailers where service_radius_km >= distance (their radius covers the booking)
  -- Order by: priority (within radius first), then distance, then rating
  SELECT d.id INTO available_detailer_id
  FROM detailers d
  INNER JOIN detailer_availability da ON da.detailer_id = d.id
  WHERE d.is_active = true
    AND da.is_active = true
    AND da.day_of_week = booking_day_of_week
    AND da.start_time <= booking_start_time
    AND da.end_time >= booking_end_time
    -- Exclude org detailers if requested (for auto-assign to solo detailers only)
    AND (NOT p_exclude_org_detailers OR d.organization_id IS NULL)
    -- Location filter with fallback logic:
    -- If no location provided, match all detailers
    -- If location provided, match detailers where:
    --   (a) distance <= service_radius_km (within radius), OR
    --   (b) service_radius_km >= distance (radius covers booking distance)
    AND (
      p_booking_lat IS NULL 
      OR p_booking_lng IS NULL 
      OR d.latitude IS NULL 
      OR d.longitude IS NULL
      OR (
        -- Within their service radius
        calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) <= COALESCE(d.service_radius_km, 50)
        OR
        -- OR their service radius is large enough to cover the booking distance
        COALESCE(d.service_radius_km, 50) >= calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng)
      )
    )
    -- Check that detailer doesn't have conflicting booking
    AND NOT EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.detailer_id = d.id
        AND b.scheduled_date = p_booking_date
        AND b.status NOT IN ('cancelled', 'no_show', 'completed')
        AND (
          -- Booking overlaps with requested time
          (b.scheduled_time_start < booking_end_time AND 
           COALESCE(b.scheduled_time_end, b.scheduled_time_start + INTERVAL '2 hours') > booking_start_time)
        )
    )
  ORDER BY 
    -- Priority 1: Within radius (distance <= service_radius_km) gets priority 1
    -- Priority 2: Fallback (service_radius_km >= distance) gets priority 2
    CASE 
      WHEN p_booking_lat IS NOT NULL 
           AND p_booking_lng IS NOT NULL 
           AND d.latitude IS NOT NULL 
           AND d.longitude IS NOT NULL THEN
        CASE 
          WHEN calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) <= COALESCE(d.service_radius_km, 50) THEN 1
          WHEN COALESCE(d.service_radius_km, 50) >= calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) THEN 2
          ELSE 3
        END
      ELSE 1
    END ASC,
    -- Then by distance (closest first)
    CASE WHEN p_booking_lat IS NOT NULL AND p_booking_lng IS NOT NULL AND d.latitude IS NOT NULL AND d.longitude IS NOT NULL
         THEN calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng)
         ELSE 9999 END ASC,
    -- Then by rating (highest first)
    d.rating DESC, 
    -- Then by availability hours (most available first)
    (da.end_time - da.start_time) DESC
  LIMIT 1;

  -- 5) Return detailer_id (may be NULL if no one available)
  RETURN available_detailer_id;
END;
$$;

COMMENT ON FUNCTION find_available_detailer IS 
'Finds an available detailer for a booking based on schedule, location, and conflicts.
Uses two-tier matching:
1. First priority: Detailers where distance <= service_radius_km (within their set radius)
2. Second priority: Detailers where service_radius_km >= distance (their radius covers the booking)
Parameters:
- p_booking_date: The date of the booking
- p_booking_time_start: Start time of the booking
- p_booking_time_end: End time (optional if duration provided)
- p_service_duration_minutes: Service duration (optional if end time provided)
- p_booking_lat/lng: Booking location for distance filtering (optional)
- p_exclude_org_detailers: If true, only returns solo detailers (for auto-assign)
Returns the detailer_id or NULL if no one is available.';

-- ============================================================================
-- Create check_detailer_availability_in_radius function with fallback logic
-- ============================================================================
-- This function checks if any detailers are available for a booking at a specific
-- location and time, using the same fallback logic as find_available_detailer.
-- ============================================================================

CREATE OR REPLACE FUNCTION check_detailer_availability_in_radius(
  p_booking_date date,
  p_booking_time_start time,
  p_booking_lat numeric,
  p_booking_lng numeric,
  p_booking_time_end time DEFAULT NULL,
  p_service_duration_minutes integer DEFAULT NULL,
  p_exclude_org_detailers boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  booking_day_of_week integer;
  calculated_end_time time;
  booking_start_time time;
  booking_end_time time;
  detailer_count integer;
  nearest_distance numeric;
  available_detailer_id uuid;
  result jsonb;
BEGIN
  -- 1) Validate required parameters
  IF p_booking_date IS NULL OR p_booking_time_start IS NULL OR p_booking_lat IS NULL OR p_booking_lng IS NULL THEN
    RAISE EXCEPTION 'booking_date, booking_time_start, booking_lat, and booking_lng are required';
  END IF;

  -- 2) Calculate day of week
  booking_day_of_week := EXTRACT(DOW FROM p_booking_date)::integer;

  -- 3) Calculate end time if not provided
  IF p_booking_time_end IS NULL THEN
    IF p_service_duration_minutes IS NULL THEN
      RAISE EXCEPTION 'Either booking_time_end or service_duration_minutes must be provided';
    END IF;
    calculated_end_time := (p_booking_time_start + (p_service_duration_minutes || ' minutes')::interval)::time;
  ELSE
    calculated_end_time := p_booking_time_end;
  END IF;

  booking_start_time := p_booking_time_start;
  booking_end_time := calculated_end_time;

  -- 4) Validate end time > start time
  IF booking_end_time <= booking_start_time THEN
    RAISE EXCEPTION 'Booking end time must be after start time';
  END IF;

  -- 5) Count available detailers and find nearest (using same fallback logic)
  WITH available_detailers AS (
    SELECT 
      d.id,
      calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) as distance,
      CASE 
        WHEN calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) <= COALESCE(d.service_radius_km, 50) THEN 1
        WHEN COALESCE(d.service_radius_km, 50) >= calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) THEN 2
        ELSE 3
      END as priority
    FROM detailers d
    INNER JOIN detailer_availability da ON da.detailer_id = d.id
    WHERE d.is_active = true
      AND da.is_active = true
      AND da.day_of_week = booking_day_of_week
      AND da.start_time <= booking_start_time
      AND da.end_time >= booking_end_time
      AND (NOT p_exclude_org_detailers OR d.organization_id IS NULL)
      AND d.latitude IS NOT NULL
      AND d.longitude IS NOT NULL
      AND (
        -- Within their service radius OR their radius covers the booking distance
        calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng) <= COALESCE(d.service_radius_km, 50)
        OR
        COALESCE(d.service_radius_km, 50) >= calculate_distance_km(d.latitude, d.longitude, p_booking_lat, p_booking_lng)
      )
      AND NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.detailer_id = d.id
          AND b.scheduled_date = p_booking_date
          AND b.status NOT IN ('cancelled', 'no_show', 'completed')
          AND (
            (b.scheduled_time_start < booking_end_time AND 
             COALESCE(b.scheduled_time_end, b.scheduled_time_start + INTERVAL '2 hours') > booking_start_time)
          )
      )
  )
  SELECT 
    COUNT(*)::integer,
    MIN(distance)
  INTO detailer_count, nearest_distance
  FROM available_detailers;

  -- 6) Build result JSON
  IF detailer_count > 0 THEN
    result := jsonb_build_object(
      'available', true,
      'detailer_count', detailer_count,
      'nearest_distance_km', nearest_distance
    );
  ELSE
    result := jsonb_build_object(
      'available', false,
      'detailer_count', 0,
      'nearest_distance_km', NULL,
      'message', 'No detailers are available in your area for this time slot. Please try a different time or location.'
    );
  END IF;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION check_detailer_availability_in_radius IS 
'Checks if any detailers are available for a booking at a specific location and time.
Uses the same two-tier matching logic as find_available_detailer:
1. First priority: Detailers where distance <= service_radius_km (within their set radius)
2. Second priority: Detailers where service_radius_km >= distance (their radius covers the booking)
Returns JSON with availability status, detailer count, and nearest distance.
Parameters:
- p_booking_date: The date of the booking (required)
- p_booking_time_start: Start time of the booking (required)
- p_booking_lat/lng: Booking location coordinates (required)
- p_booking_time_end: End time (optional if duration provided)
- p_service_duration_minutes: Service duration (optional if end time provided)
- p_exclude_org_detailers: If true, only checks solo detailers (optional, default false)
Returns JSON: {"available": true/false, "detailer_count": N, "nearest_distance_km": X, "message": "..."}';

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_detailer_availability_in_radius TO authenticated;
GRANT EXECUTE ON FUNCTION check_detailer_availability_in_radius TO anon;

