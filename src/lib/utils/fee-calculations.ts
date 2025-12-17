/**
 * Fee Calculation Utilities
 * 
 * These functions MUST match the database calculate_stripe_fees() function exactly.
 * Database logic:
 * - Processing fee: (amount * 2.9 / 100) + 0.30
 * - Connect fee: (amount * 0.25 / 100) + 0.25
 * - Both rounded to 2 decimal places using ROUND()
 */

/**
 * Calculate Stripe fees - MUST match database calculate_stripe_fees() function
 * @param subtotal - The amount to calculate fees on (service + addons + tax)
 * @returns Object with processingFee, connectFee, and totalFees
 */
export function calculateStripeFees(subtotal: number): {
  processingFee: number;
  connectFee: number;
  totalFees: number;
} {
  const stripeProcessingPercentage = 2.9;
  const stripeProcessingFixed = 0.30;
  const stripeConnectPercentage = 0.25;
  const stripeConnectFixed = 0.25;

  // Match database calculation exactly
  const processingFee = (subtotal * stripeProcessingPercentage / 100) + stripeProcessingFixed;
  const connectFee = (subtotal * stripeConnectPercentage / 100) + stripeConnectFixed;

  // Round to 2 decimal places (match database ROUND function)
  const roundedProcessingFee = Math.round(processingFee * 100) / 100;
  const roundedConnectFee = Math.round(connectFee * 100) / 100;
  const totalFees = Math.round((roundedProcessingFee + roundedConnectFee) * 100) / 100;

  return {
    processingFee: roundedProcessingFee,
    connectFee: roundedConnectFee,
    totalFees,
  };
}

/**
 * Calculate tax - accepts rate as decimal (0.13 = 13%)
 * @param subtotal - The amount to calculate tax on (service + addons)
 * @param taxRate - Tax rate as decimal (e.g., 0.13 for 13%)
 * @returns Tax amount rounded to 2 decimal places
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  const taxAmount = subtotal * taxRate;
  return Math.round(taxAmount * 100) / 100;
}

/**
 * Calculate complete total with all fees
 * This matches the database calculation flow:
 * 1. Subtotal = service + addons
 * 2. Tax = subtotal * taxRate
 * 3. Subtotal with tax = subtotal + tax
 * 4. Stripe fees calculated on subtotal with tax
 * 5. Total = subtotal with tax + stripe fees
 * 
 * @param servicePrice - Base service price
 * @param taxRate - Tax rate as decimal (e.g., 0.13 for 13%)
 * @param addonsTotal - Total of all add-ons (default 0)
 * @returns Complete breakdown with all fees
 */
export function calculateTotalAmount(
  servicePrice: number,
  taxRate: number,
  addonsTotal: number = 0
): {
  subtotal: number;
  taxAmount: number;
  processingFee: number;
  connectFee: number;
  totalAmount: number;
} {
  // Step 1: Calculate subtotal (service + addons)
  const subtotal = servicePrice + addonsTotal;

  // Step 2: Calculate tax on subtotal
  const taxAmount = calculateTax(subtotal, taxRate);

  // Step 3: Calculate subtotal with tax (this is what Stripe fees are calculated on)
  const subtotalWithTax = subtotal + taxAmount;

  // Step 4: Calculate Stripe fees on subtotal with tax
  const { processingFee, connectFee, totalFees } = calculateStripeFees(subtotalWithTax);

  // Step 5: Calculate final total
  const totalAmount = subtotalWithTax + totalFees;

  return {
    subtotal,
    taxAmount,
    processingFee,
    connectFee,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}


