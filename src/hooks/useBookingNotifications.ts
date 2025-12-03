import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReceipt } from '../contexts/ReceiptContext';
import { supabase } from '../lib/supabase';

/**
 * Hook to listen for booking status changes and send notifications
 * This uses Supabase Realtime to listen for changes to bookings
 */
export function useBookingNotifications() {
  const { user } = useAuth();
  const { showReceipt } = useReceipt();

  useEffect(() => {
    if (!user) return;

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Subscribe to booking changes for this user
    const channel = supabase
      .channel(`bookings:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const booking = payload.new as any;
          const oldBooking = payload.old as any;

          // Only notify on status changes
          if (booking.status !== oldBooking.status) {
            handleStatusChange(booking, oldBooking.status, showReceipt);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showReceipt]);
}

async function handleStatusChange(
  booking: any,
  oldStatus: string,
  showReceipt?: (bookingId: string) => void
) {
  const statusMessages: Record<string, string> = {
    paid: 'Your payment was successful! Your booking is confirmed.',
    accepted: 'A detailer has accepted your booking!',
    in_progress: 'Your detailer has started working on your car.',
    completed: 'Your service is complete! Please rate your detailer.',
    cancelled: 'Your booking has been cancelled.',
  };

  const message = statusMessages[booking.status];
  if (!message) return;

  // Always send notification for completed bookings
  if (booking.status === 'completed') {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      // Schedule notification - always send for completed bookings
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Service Complete! 🎉',
          body: 'Your detail is complete! Please rate your detailer.',
          data: { bookingId: booking.id, status: 'completed' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });
    }

    // Show receipt modal immediately if app is open
    if (showReceipt) {
      // Small delay to ensure notification is sent first
      setTimeout(() => {
        showReceipt(booking.id);
      }, 500);
    }
  } else {
    // For other statuses, request permissions and send notification
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Booking Update',
          body: message,
          data: { bookingId: booking.id },
        },
        trigger: null, // Show immediately
      });
    }
  }
}

/**
 * Hook for detailers to listen for new available bookings
 */
export function useDetailerBookingNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new paid bookings (available for detailers)
    const channel = supabase
      .channel(`available-bookings`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: 'payment_status=eq.paid',
        },
        async (payload) => {
          const booking = payload.new as any;
          const oldBooking = payload.old as any;

          // Notify when a booking becomes available (paid and unassigned)
          if (
            booking.payment_status === 'paid' &&
            !booking.detailer_id &&
            (oldBooking.payment_status !== 'paid' || oldBooking.detailer_id)
          ) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: 'New Booking Available',
                  body: `A new ${booking.service_id ? 'booking' : 'service'} is available near you!`,
                  data: { bookingId: booking.id },
                },
                trigger: null,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}

