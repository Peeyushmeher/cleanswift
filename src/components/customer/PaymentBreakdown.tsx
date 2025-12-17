import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { calculateTotalAmount, calculateTax, calculateStripeFees } from '../../lib/utils/fee-calculations';

interface CustomerPaymentBreakdownProps {
  servicePrice: number;
  addonsTotal?: number;
  taxAmount?: number;
  taxRate?: number; // As decimal (0.13 = 13%)
  stripeProcessingFee?: number;
  stripeConnectFee?: number;
  totalAmount?: number;
  // Optional: pass individual addons for display
  addons?: Array<{ id: string; name: string; price: number }>;
  // Optional: show section title
  showTitle?: boolean;
  title?: string;
}

/**
 * CustomerPaymentBreakdown - Reusable component for displaying payment breakdown
 * 
 * This component can work in two modes:
 * 1. Pre-calculated: Pass all values directly (recommended when using booking data from database)
 * 2. Calculated: Pass servicePrice, addonsTotal, and taxRate, component will calculate fees
 */
export default function CustomerPaymentBreakdown({
  servicePrice,
  addonsTotal = 0,
  taxAmount: providedTaxAmount,
  taxRate = 0.13, // Default 13% HST
  stripeProcessingFee: providedProcessingFee,
  stripeConnectFee: providedConnectFee,
  totalAmount: providedTotalAmount,
  addons,
  showTitle = false,
  title = 'Price Breakdown',
}: CustomerPaymentBreakdownProps) {
  // Calculate values if not provided
  const calculated = useMemo(() => {
    // Calculate subtotal for tax calculation
    const finalAddonsTotal = addons
      ? addons.reduce((sum, addon) => sum + addon.price, 0)
      : addonsTotal;
    const subtotal = servicePrice + finalAddonsTotal;

    // If taxAmount is 0 or not provided, calculate it
    let finalTaxAmount = providedTaxAmount;
    if (finalTaxAmount === undefined || finalTaxAmount === 0) {
      finalTaxAmount = calculateTax(subtotal, taxRate);
    }

    // Calculate subtotal with tax for Stripe fees
    const subtotalWithTax = subtotal + finalTaxAmount;

    // If fees are not provided, calculate them
    let finalProcessingFee = providedProcessingFee;
    let finalConnectFee = providedConnectFee;
    if (finalProcessingFee === undefined || finalConnectFee === undefined) {
      const fees = calculateStripeFees(subtotalWithTax);
      finalProcessingFee = finalProcessingFee ?? fees.processingFee;
      finalConnectFee = finalConnectFee ?? fees.connectFee;
    }

    // Calculate total - use simple addition to match OrdersHistoryScreen calculation
    // This ensures consistency: servicePrice + addonsTotal + taxAmount + processingFee + connectFee
    const finalTotal = servicePrice + finalAddonsTotal + finalTaxAmount + (finalProcessingFee || 0) + (finalConnectFee || 0);
    const roundedTotal = Math.round(finalTotal * 100) / 100;

    return {
      taxAmount: finalTaxAmount,
      processingFee: finalProcessingFee || 0,
      connectFee: finalConnectFee || 0,
      totalAmount: roundedTotal,
    };
  }, [
    servicePrice,
    addonsTotal,
    addons,
    taxRate,
    providedTaxAmount,
    providedProcessingFee,
    providedConnectFee,
    providedTotalAmount,
  ]);

  const { taxAmount, processingFee, connectFee, totalAmount } = calculated;

  // Calculate addons total from individual addons if provided
  const finalAddonsTotal = addons
    ? addons.reduce((sum, addon) => sum + addon.price, 0)
    : addonsTotal;

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {showTitle && <Text style={styles.sectionTitle}>{title}</Text>}

      <View style={styles.priceRows}>
        {/* Service Price */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Service</Text>
          <Text style={styles.priceValue}>{formatCurrency(servicePrice)}</Text>
        </View>

        {/* Add-ons - show individual addons if provided, otherwise show total */}
        {addons && addons.length > 0 ? (
          addons.map((addon) => (
            <View key={addon.id} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{addon.name}</Text>
              <Text style={styles.priceValue}>{formatCurrency(addon.price)}</Text>
            </View>
          ))
        ) : finalAddonsTotal > 0 ? (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Add-ons</Text>
            <Text style={styles.priceValue}>{formatCurrency(finalAddonsTotal)}</Text>
          </View>
        ) : null}

        {/* Tax - Always show if there's a service price */}
        {servicePrice > 0 && taxAmount > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>HST</Text>
            <Text style={styles.priceValue}>{formatCurrency(taxAmount)}</Text>
          </View>
        )}

        {/* Processing Fee - Combined Stripe fees */}
        {(processingFee > 0 || connectFee > 0) && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Processing Fee</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(processingFee + connectFee)}
            </Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  priceRows: {
    // Container for all price rows
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  priceValue: {
    color: '#F5F7FA',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(198,207,217,0.2)',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    color: '#6FF0C4',
    fontSize: 24,
    fontWeight: '700',
  },
});

