import React, { createContext, useContext, useState, useCallback } from 'react';

// Types matching our database schema
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  display_order: number;
}

interface ServiceAddon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  display_order: number;
}

interface Car {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: string;
  trim: string | null;
  license_plate: string;
  color: string | null;
  photo_url: string | null;
  is_primary: boolean;
}

interface Detailer {
  id: string;
  full_name: string;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  years_experience: number;
  is_active: boolean;
}

interface PriceBreakdown {
  servicePrice: number;
  addonsTotal: number;
  taxAmount: number;
  totalAmount: number;
}

interface BookingContextType {
  // State
  selectedService: Service | null;
  selectedAddons: ServiceAddon[];
  selectedCar: Car | null;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  selectedDetailer: Detailer | null;
  priceBreakdown: PriceBreakdown;

  // Actions
  setService: (service: Service | null) => void;
  setAddons: (addons: ServiceAddon[]) => void;
  setCar: (car: Car | null) => void;
  setDateTime: (date: Date, timeSlot: string) => void;
  setDetailer: (detailer: Detailer | null) => void;
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

  const setDetailer = useCallback((detailer: Detailer | null) => {
    setSelectedDetailer(detailer);
  }, []);

  const clearBooking = useCallback(() => {
    setSelectedService(null);
    setSelectedAddons([]);
    setSelectedCar(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedDetailer(null);
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
    priceBreakdown,
    setService,
    setAddons,
    setCar,
    setDateTime,
    setDetailer,
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
export type { Service, ServiceAddon, Car, Detailer, PriceBreakdown };
