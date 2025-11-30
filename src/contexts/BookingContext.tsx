import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  Service,
  ServiceAddon,
  Car,
  Detailer,
  BookingLocation,
  PaymentMethod,
  PriceBreakdown,
} from '../types/domain';

interface BookingContextType {
  // State
  selectedService: Service | null;
  selectedAddons: ServiceAddon[];
  selectedCar: Car | null;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  selectedDetailer: Detailer | null;
  selectedLocation: BookingLocation | null;
  priceBreakdown: PriceBreakdown;

  // Actions
  setService: (service: Service | null) => void;
  setAddons: (addons: ServiceAddon[]) => void;
  setCar: (car: Car | null) => void;
  setDateTime: (date: Date, timeSlot: string) => void;
  setDate: (date: Date | null) => void;
  setTime: (timeSlot: string | null) => void;
  setDetailer: (detailer: Detailer | null) => void;
  setLocation: (location: BookingLocation | null) => void;
  calculateTotals: () => void;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const HST_RATE = 0.13; // 13% HST for Ontario

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDetailer, setSelectedDetailer] = useState<Detailer | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<BookingLocation | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>({
    servicePrice: 0,
    addonsTotal: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  const calculateTotals = useCallback(() => {
    const servicePrice = selectedService?.price || 0;
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const subtotal = servicePrice + addonsTotal;
    const taxAmount = subtotal * HST_RATE;
    const totalAmount = subtotal + taxAmount;

    setPriceBreakdown({
      servicePrice,
      addonsTotal,
      taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimal places
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  }, [selectedService, selectedAddons]);

  const setService = useCallback((service: Service | null) => {
    setSelectedService(service);
  }, []);

  const setAddons = useCallback((addons: ServiceAddon[]) => {
    setSelectedAddons(addons);
  }, []);

  const setCar = useCallback((car: Car | null) => {
    setSelectedCar(car);
  }, []);

  const setDateTime = useCallback((date: Date, timeSlot: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
  }, []);

  const setDate = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, []);

  const setTime = useCallback((timeSlot: string | null) => {
    setSelectedTimeSlot(timeSlot);
  }, []);

  const setDetailer = useCallback((detailer: Detailer | null) => {
    setSelectedDetailer(detailer);
  }, []);

  const setLocation = useCallback((location: BookingLocation | null) => {
    setSelectedLocation(location);
  }, []);

  const clearBooking = useCallback(() => {
    setSelectedService(null);
    setSelectedAddons([]);
    setSelectedCar(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedDetailer(null);
    setSelectedLocation(null);
    setPriceBreakdown({
      servicePrice: 0,
      addonsTotal: 0,
      taxAmount: 0,
      totalAmount: 0,
    });
  }, []);

  // Recalculate totals whenever service or addons change
  React.useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const value: BookingContextType = {
    selectedService,
    selectedAddons,
    selectedCar,
    selectedDate,
    selectedTimeSlot,
    selectedDetailer,
    selectedLocation,
    priceBreakdown,
    setService,
    setAddons,
    setCar,
    setDateTime,
    setDate,
    setTime,
    setDetailer,
    setLocation,
    calculateTotals,
    clearBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

// Export types for use in other files
export type { Service, ServiceAddon, Car, Detailer, PriceBreakdown, BookingLocation };
