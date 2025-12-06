/**
 * Availability Check Utilities
 * 
 * Helper functions for formatting dates and times for the availability RPC functions
 */

/**
 * Parses a time slot string (e.g., "9:00 AM", "1:30 PM") and converts it to "HH:mm:ss" format
 * @param timeSlot - Time string in format like "9:00 AM" or "1:30 PM"
 * @returns Time string in "HH:mm:ss" format (e.g., "09:00:00", "13:30:00")
 */
export function formatTimeForRPC(timeSlot: string): string {
  if (!timeSlot) {
    throw new Error('Time slot is required');
  }

  // Remove any extra whitespace
  const trimmed = timeSlot.trim();
  
  // Try to parse common formats
  // Format 1: "9:00 AM" or "1:30 PM"
  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = parseInt(amPmMatch[2], 10);
    const period = amPmMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }

  // Format 2: Already in "HH:mm" or "HH:mm:ss" format
  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = timeMatch[3] || '00';

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid time: ${timeSlot}`);
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }

  throw new Error(`Unable to parse time format: ${timeSlot}`);
}

/**
 * Parses a time slot string and returns an object with hours and minutes
 * @param timeSlot - Time string in format like "9:00 AM" or "1:30 PM"
 * @returns Object with { hours: number, minutes: number }
 */
export function parseTimeSlot(timeSlot: string): { hours: number; minutes: number } {
  const formatted = formatTimeForRPC(timeSlot);
  const [hours, minutes] = formatted.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Formats a Date object to "YYYY-MM-DD" format for RPC calls
 * @param date - Date object
 * @returns Date string in "YYYY-MM-DD" format
 */
export function formatDateForRPC(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Converts a date string (day number) and creates a proper Date object
 * This handles the case where date is passed as just a day number string
 * @param dateString - Date string (could be day number like "16" or full date)
 * @returns Date object
 */
export function parseDateFromRoute(dateString: string | undefined, timeSlot?: string): Date | null {
  if (!dateString) {
    return null;
  }

  // If it's just a day number (from BookingDateTimeScreen)
  const dayNumber = parseInt(dateString, 10);
  if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
    const today = new Date();
    const selectedDate = new Date(today.getFullYear(), today.getMonth(), dayNumber);
    
    // If the selected day is in the past (e.g., today is 15th, user selected 5th),
    // it means they want next month's date
    if (selectedDate < today) {
      // Move to next month
      return new Date(today.getFullYear(), today.getMonth() + 1, dayNumber);
    }
    
    return selectedDate;
  }

  // Try to parse as ISO date string
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

