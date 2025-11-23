/**
 * Address validation utilities for Canadian addresses
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates street address format
 * Must contain at least one number and one letter, minimum 5 characters
 */
export function validateStreetAddress(address: string): ValidationResult {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'Street address is required' };
  }

  const trimmed = address.trim();

  if (trimmed.length < 5) {
    return { isValid: false, error: 'Street address must be at least 5 characters' };
  }

  // Must contain at least one number and one letter
  const hasNumber = /\d/.test(trimmed);
  const hasLetter = /[a-zA-Z]/.test(trimmed);

  if (!hasNumber || !hasLetter) {
    return { isValid: false, error: 'Street address must contain both numbers and letters' };
  }

  return { isValid: true };
}

/**
 * Validates city name
 * Letters and spaces only, minimum 2 characters
 */
export function validateCity(city: string): ValidationResult {
  if (!city || city.trim().length === 0) {
    return { isValid: false, error: 'City is required' };
  }

  const trimmed = city.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'City must be at least 2 characters' };
  }

  // Letters and spaces only
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return { isValid: false, error: 'City can only contain letters and spaces' };
  }

  return { isValid: true };
}

/**
 * Validates Canadian province code
 * Must be 2 uppercase letters
 */
export function validateProvince(province: string): ValidationResult {
  if (!province || province.trim().length === 0) {
    return { isValid: false, error: 'Province is required' };
  }

  const trimmed = province.trim().toUpperCase();

  if (trimmed.length !== 2) {
    return { isValid: false, error: 'Province must be 2 letters (e.g., ON, BC, QC)' };
  }

  // Must be 2 uppercase letters
  if (!/^[A-Z]{2}$/.test(trimmed)) {
    return { isValid: false, error: 'Province must be 2 letters only' };
  }

  // Optional: Validate against Canadian province codes
  const validProvinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
  if (!validProvinces.includes(trimmed)) {
    return { isValid: false, error: 'Please enter a valid Canadian province code' };
  }

  return { isValid: true };
}

/**
 * Validates and normalizes Canadian postal code
 * Format: A1A 1A1 (letter-digit-letter space digit-letter-digit)
 */
export function validatePostalCode(postalCode: string): ValidationResult {
  if (!postalCode || postalCode.trim().length === 0) {
    return { isValid: false, error: 'Postal code is required' };
  }

  const trimmed = postalCode.trim().toUpperCase();

  // Canadian postal code pattern: A1A 1A1 or A1A1A1
  const postalCodeRegex = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

  if (!postalCodeRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid Canadian postal code (e.g., M1M 1M1)' };
  }

  return { isValid: true };
}

/**
 * Normalizes Canadian postal code to A1A 1A1 format
 * Adds space in the middle if missing
 */
export function normalizePostalCode(postalCode: string): string {
  if (!postalCode) return '';

  // Remove all spaces and convert to uppercase
  const cleaned = postalCode.replace(/\s+/g, '').toUpperCase();

  // Must be 6 characters
  if (cleaned.length !== 6) return postalCode;

  // Format: A1A 1A1
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
}

/**
 * Normalizes province code to uppercase
 */
export function normalizeProvince(province: string): string {
  if (!province) return '';
  return province.trim().toUpperCase();
}

