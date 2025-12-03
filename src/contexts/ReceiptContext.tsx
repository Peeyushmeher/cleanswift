import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ReceiptContextType {
  visible: boolean;
  bookingId: string | null;
  showReceipt: (bookingId: string) => void;
  hideReceipt: () => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const showReceipt = (id: string) => {
    console.log('ReceiptContext: showReceipt called with bookingId:', id);
    setBookingId(id);
    setVisible(true);
  };

  const hideReceipt = () => {
    setVisible(false);
    // Clear bookingId after a short delay to allow modal close animation
    setTimeout(() => {
      setBookingId(null);
    }, 300);
  };

  return (
    <ReceiptContext.Provider value={{ visible, bookingId, showReceipt, hideReceipt }}>
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipt() {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error('useReceipt must be used within a ReceiptProvider');
  }
  return context;
}
