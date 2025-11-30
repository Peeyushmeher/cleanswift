/**
 * Google Maps Geocoding and Places API service
 * 
 * Requires EXPO_PUBLIC_GOOGLE_MAPS_API_KEY environment variable
 */

const rawApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const normalizedKey = rawApiKey.trim();
const PLACEHOLDER_VALUES = new Set(['', 'your_api_key_here', 'YOUR_API_KEY_HERE']);

export const isGoogleMapsConfigured = !PLACEHOLDER_VALUES.has(normalizedKey);
const GOOGLE_MAPS_API_KEY = isGoogleMapsConfigured ? normalizedKey : '';

if (!isGoogleMapsConfigured) {
  console.warn('⚠️ Google Maps API key is not configured. Geocoding features are disabled until a valid EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is provided.');
} else {
  // Log partial key for debugging (first 10 chars + last 4 chars)
  const keyPreview = normalizedKey.length > 14 
    ? `${normalizedKey.substring(0, 10)}...${normalizedKey.substring(normalizedKey.length - 4)}`
    : '***';
  console.log('✅ Google Maps API key loaded:', keyPreview);
}

export interface GeocodeResult {
  formattedAddress: string;
  addressComponents: {
    streetNumber?: string;
    streetName?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetailsResult {
  formattedAddress: string;
  addressComponents: {
    streetNumber?: string;
    streetName?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  latitude: number;
  longitude: number;
  placeId: string;
}

/**
 * Geocodes an address string using Google Geocoding API
 * @param address Full address string (e.g., "123 Main St, Toronto, ON M1M 1M1, Canada")
 * @returns Geocoded result with normalized address and coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.');
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}&region=ca`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No results found for this address. Please check and try again.');
    }

    if (data.status === 'REQUEST_DENIED') {
      const errorMsg = data.error_message || 'No error message provided';
      console.error('⚠️ Geocoding REQUEST_DENIED:', errorMsg);
      console.error('Common causes: Geocoding API not enabled, API key restrictions, or billing not enabled');
      throw new Error(`Geocoding request denied: ${errorMsg}`);
    }

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Geocoding failed: ${data.status || 'Unknown error'}`);
    }

    const result = data.results[0];
    const location = result.geometry.location;

    // Extract address components
    const components: GeocodeResult['addressComponents'] = {};
    
    result.address_components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        components.streetName = component.long_name;
      }
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        components.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        components.province = component.short_name;
      }
      if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
      if (types.includes('country')) {
        components.country = component.short_name;
      }
    });

    // Validate country is Canada
    if (components.country !== 'CA') {
      throw new Error('Address must be in Canada');
    }

    // Check result confidence (geometry.location_type)
    // ROOFTOP = highest confidence, RANGE_INTERPOLATED = good, GEOMETRIC_CENTER = lower, APPROXIMATE = lowest
    const locationType = result.geometry.location_type;
    if (locationType === 'APPROXIMATE') {
      throw new Error('Address could not be verified precisely. Please provide a more specific address.');
    }

    return {
      formattedAddress: result.formatted_address,
      addressComponents: components,
      latitude: location.lat,
      longitude: location.lng,
      placeId: result.place_id,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to geocode address. Please try again.');
  }
}

/**
 * Gets place details using Google Places API Place Details
 * @param placeId Google Place ID
 * @returns Place details with normalized address and coordinates
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.');
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,address_components,geometry,place_id&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      throw new Error(`Place details failed: ${data.status || 'Unknown error'}`);
    }

    const result = data.result;
    const location = result.geometry.location;

    // Extract address components
    const components: PlaceDetailsResult['addressComponents'] = {};
    
    result.address_components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        components.streetName = component.long_name;
      }
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        components.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        components.province = component.short_name;
      }
      if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
      if (types.includes('country')) {
        components.country = component.short_name;
      }
    });

    // Validate country is Canada
    if (components.country !== 'CA') {
      throw new Error('Address must be in Canada');
    }

    return {
      formattedAddress: result.formatted_address,
      addressComponents: components,
      latitude: location.lat,
      longitude: location.lng,
      placeId: result.place_id,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get place details. Please try again.');
  }
}

/**
 * Gets autocomplete suggestions using Google Places API Autocomplete
 * @param input User input string (minimum 3 characters recommended)
 * @param region Optional region code (default: 'ca' for Canada)
 * @returns Array of autocomplete predictions
 */
export async function autocompletePlaces(
  input: string,
  region: string = 'ca'
): Promise<AutocompletePrediction[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.');
  }

  if (!input || input.trim().length < 3) {
    return [];
  }

  const encodedInput = encodeURIComponent(input.trim());
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedInput}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca&types=address`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      const errorMsg = data.error_message || 'No error message provided';
      console.warn('Autocomplete API error:', data.status, '-', errorMsg);
      if (data.status === 'REQUEST_DENIED') {
        console.error('⚠️ REQUEST_DENIED - Common causes:');
        console.error('  1. Places API not enabled in Google Cloud Console');
        console.error('  2. Application restrictions blocking requests (use iOS/Android bundle ID, not IP restrictions)');
        console.error('  3. Billing not enabled (required even for free tier)');
        console.error('  4. Invalid API key');
        if (errorMsg.includes('not authorized')) {
          console.error('  → This error indicates application restrictions need to be configured for mobile apps');
        }
      }
      return [];
    }

    if (!data.predictions || data.predictions.length === 0) {
      return [];
    }

    return data.predictions.map((prediction: any) => {
      // Parse structured_formatting if available
      const mainText = prediction.structured_formatting?.main_text || prediction.description.split(',')[0];
      const secondaryText = prediction.structured_formatting?.secondary_text || prediction.description.split(',').slice(1).join(',').trim();

      return {
        placeId: prediction.place_id,
        description: prediction.description,
        mainText,
        secondaryText,
      };
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}

