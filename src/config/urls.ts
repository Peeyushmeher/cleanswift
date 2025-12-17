/**
 * External URLs configuration
 * 
 * Update these URLs once you have hosted your Privacy Policy and Terms of Service documents.
 * You can also use environment variables if needed for different environments.
 */

// Base URL for policy documents (update when hosting is set up)
const POLICY_BASE_URL = 
  process.env.EXPO_PUBLIC_POLICY_BASE_URL || 
  'https://cleanswift.app';

/**
 * Privacy Policy URL
 * Required for App Store submission
 */
export const PRIVACY_POLICY_URL = `${POLICY_BASE_URL}/privacy-policy`;

/**
 * Terms of Service URL
 */
export const TERMS_OF_SERVICE_URL = `${POLICY_BASE_URL}/terms-of-service`;

/**
 * Refund Policy URL
 * Can be a separate page or link to relevant section in Terms of Service
 */
export const REFUND_POLICY_URL = `${POLICY_BASE_URL}/refund-policy`;
