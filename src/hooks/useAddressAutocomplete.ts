import { useState, useEffect, useCallback } from 'react';
import { autocompletePlaces, getPlaceDetails, type AutocompletePrediction, type PlaceDetailsResult } from '../services/googleGeocoding';

interface UseAddressAutocompleteOptions {
  debounceMs?: number;
  minInputLength?: number;
}

interface UseAddressAutocompleteReturn {
  suggestions: AutocompletePrediction[];
  isLoading: boolean;
  error: string | null;
  searchAddress: (input: string) => void;
  selectPlace: (placeId: string) => Promise<PlaceDetailsResult | null>;
  clearSuggestions: () => void;
}

/**
 * Hook for managing address autocomplete functionality
 * Provides debounced autocomplete search and place selection
 */
export function useAddressAutocomplete(
  options: UseAddressAutocompleteOptions = {}
): UseAddressAutocompleteReturn {
  const { debounceMs = 300, minInputLength = 3 } = options;

  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const searchAddress = useCallback(
    (input: string) => {
      // Clear previous timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Clear suggestions if input is too short
      if (!input || input.trim().length < minInputLength) {
        setSuggestions([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Set loading state
      setIsLoading(true);
      setError(null);

      // Create new debounced search
      const timer = setTimeout(async () => {
        try {
          const results = await autocompletePlaces(input.trim());
          setSuggestions(results);
          setIsLoading(false);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suggestions';
          setError(errorMessage);
          setSuggestions([]);
          setIsLoading(false);
        }
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [debounceMs, minInputLength, debounceTimer]
  );

  const selectPlace = useCallback(async (placeId: string): Promise<PlaceDetailsResult | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const placeDetails = await getPlaceDetails(placeId);
      setSuggestions([]); // Clear suggestions after selection
      setIsLoading(false);
      return placeDetails;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get place details';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    suggestions,
    isLoading,
    error,
    searchAddress,
    selectPlace,
    clearSuggestions,
  };
}

