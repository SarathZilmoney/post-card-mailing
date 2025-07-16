import { formatDistanceToNow } from 'date-fns';

/**
 * Utility functions for handling dates consistently across the application
 * Addresses timezone issues between backend and frontend
 */

/**
 * Parse a date string and ensure it's interpreted correctly regardless of timezone format
 * @param dateString - The date string from the backend
 * @returns Date object with proper timezone handling
 */
export const parseBackendDate = (dateString: string): Date => {
  if (!dateString) {
    return new Date();
  }

  try {
    // Handle various date formats from backend
    let date: Date;

    // If the date already has timezone info (ends with Z or has +/- offset)
    if (dateString.includes('Z') || /[+-]\d{2}:\d{2}$/.test(dateString)) {
      // Parse as-is since it has timezone info
      date = new Date(dateString);
    } else {
      // Assume UTC if no timezone info and add Z
      const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
      date = new Date(utcDateString);
    }

    // Validate the parsed date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date parsed:', dateString);
      return new Date();
    }

    return date;
  } catch (error) {
    console.warn('Error parsing date:', dateString, error);
    return new Date();
  }
};

/**
 * Format a backend date string as a relative time (e.g., "2 hours ago")
 * @param dateString - The date string from the backend
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = parseBackendDate(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Format a date string for HTML date input (YYYY-MM-DD)
 * @param dateString - The date string from the backend
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString?: string): string => {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    const date = parseBackendDate(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error formatting date for input:', dateString, error);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Debug function to log date parsing information
 * Only active in development mode
 */
export const debugDateInfo = (label: string, dateString: string): void => {
  if (import.meta.env.DEV) {
    const originalDate = new Date(dateString);
    const parsedDate = parseBackendDate(dateString);
    const timezoneOffset = new Date().getTimezoneOffset();
    
    console.log(`${label} Date Debug:`, {
      original_string: dateString,
      original_parsed: originalDate,
      corrected_parsed: parsedDate,
      relative_time: formatRelativeTime(dateString),
      timezone_offset_minutes: timezoneOffset,
      user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }
}; 