import { ErrorMessage } from './errormessage';

/**
 * Timezone utility functions for handling time-based menu schedules
 * Supports conversion between HQ timezone and branch local timezone
 */

// Common timezone mappings
export const TIMEZONES = {
  'UTC': 'UTC',
  'America/New_York': 'Eastern Time (ET)',
  'America/Chicago': 'Central Time (CT)',
  'America/Denver': 'Mountain Time (MT)',
  'America/Los_Angeles': 'Pacific Time (PT)',
  'Europe/London': 'London (GMT/BST)',
  'Europe/Paris': 'Central European (CET)',
  'Europe/Berlin': 'Central European (CET)',
  'Asia/Tokyo': 'Japan (JST)',
  'Asia/Shanghai': 'China (CST)',
  'Asia/Kolkata': 'India (IST)',
  'Asia/Dubai': 'Gulf (GST)',
  'Australia/Sydney': 'Sydney (AEST)',
  'Pacific/Auckland': 'New Zealand (NZST)',
} as const;

export type TimezoneKey = keyof typeof TIMEZONES;

/**
 * Get the day of week from a date (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export const getDayOfWeek = (date: Date): number => {
  const day = date.getDay();
  return day;
};

/**
 * Get the current day of week as an array (for database queries)
 */
export const getDayOfWeekArray = (date: Date): number[] => {
  return [getDayOfWeek(date)];
};

/**
 * Parse time string (HH:MM) to hours and minutes
 */
export const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Convert time string to Date object
 */
export const timeStringToDate = (timeStr: string, date: Date = new Date()): Date => {
  const { hours, minutes } = parseTimeString(timeStr);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

/**
 * Compare two time strings
 * Returns: -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 */
export const compareTimeStrings = (time1: string, time2: string): number => {
  const date1 = timeStringToDate(time1);
  const date2 = timeStringToDate(time2);
  const diff = date1.getTime() - date2.getTime();
  
  if (diff < 0) return -1;
  if (diff > 0) return 1;
  return 0;
};

/**
 * Check if a time is within a range
 */
export const isTimeInRange = (
  currentTime: string,
  startTime: string,
  endTime: string
): boolean => {
  const current = timeStringToDate(currentTime);
  const start = timeStringToDate(startTime);
  const end = timeStringToDate(endTime);

  // Handle overnight schedules (e.g., 22:00 - 02:00)
  if (end < start) {
    return current >= start || current <= end;
  }

  return current >= start && current <= end;
};

/**
 * Check if current date is within a date range
 */
export const isDateInRange = (
  currentDate: Date,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return currentDate >= start && currentDate <= end;
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get current time in specific timezone
 * Note: This is a simplified implementation
 * For production, consider using a library like 'date-fns-tz' or 'luxon'
 */
export const getCurrentTimeInTimezone = (timezone: string): Date => {
  const now = new Date();
  
  // Get the offset for the target timezone
  // This is a simplified approach - in production, use proper timezone libraries
  const targetDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const diffMs = targetDate.getTime() - utcDate.getTime();
  
  return new Date(now.getTime() + diffMs);
};

/**
 * Convert a date from one timezone to another
 */
export const convertTimezone = (
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date => {
  // Convert to UTC first
  const utcString = date.toLocaleString('en-US', { timeZone: fromTimezone });
  const utcDate = new Date(utcString);
  
  // Convert to target timezone
  const targetString = utcDate.toLocaleString('en-US', { timeZone: toTimezone });
  return new Date(targetString);
};

/**
 * Get branch local time from HQ perspective
 * Useful when HQ wants to see what time it is at a branch
 */
export const getBranchLocalTime = (branchTimezone: string): Date => {
  return getCurrentTimeInTimezone(branchTimezone);
};

/**
 * Validate timezone string
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

/**
 * Get all available timezones
 */
export const getAvailableTimezones = (): string[] => {
  return Object.keys(TIMEZONES);
};

/**
 * Get timezone display name
 */
export const getTimezoneDisplayName = (timezone: string): string => {
  return TIMEZONES[timezone as TimezoneKey] || timezone;
};

/**
 * Validate schedule time range
 */
export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return false;
  
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);
  
  if (start.hours === end.hours && start.minutes === end.minutes) {
    return false; // Same start and end time is invalid unless it's a 24-hour schedule
  }
  
  return true;
};

/**
 * Validate schedule date range
 */
export const validateDateRange = (startDate: Date | string, endDate: Date | string): boolean => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return end > start;
};

/**
 * Parse query time parameter (supports HH:MM format)
 */
export const parseQueryTime = (timeParam: string | undefined): string | null => {
  if (!timeParam) return null;
  
  // Accept formats: HH:MM, HH:MM:SS
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const match = timeParam.match(timeRegex);
  
  if (!match) return null;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Parse query date parameter (supports YYYY-MM-DD format)
 */
export const parseQueryDate = (dateParam: string | undefined): Date | null => {
  if (!dateParam) return new Date(); // Default to today
  
  const date = new Date(dateParam);
  if (isNaN(date.getTime())) return null;
  
  return date;
};

/**
 * Check if a day of week is valid (0-6)
 */
export const isValidDayOfWeek = (day: number): boolean => {
  return day >= 0 && day <= 6;
};

/**
 * Validate day of week array
 */
export const validateDayOfWeekArray = (days: number[] | undefined): boolean => {
  if (!days || !Array.isArray(days)) return true; // Optional, so undefined is valid
  if (days.length === 0) return true; // Empty array is valid
  
  return days.every(day => isValidDayOfWeek(day));
};

/**
 * Get day name from day number
 */
export const getDayName = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
};

/**
 * Custom error class for timezone-related errors
 */
export class TimezoneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimezoneError';
  }
}

/**
 * Safely get current time in timezone with error handling
 */
export const getCurrentTimeSafe = (timezone: string): Date => {
  if (!isValidTimezone(timezone)) {
    throw new TimezoneError(ErrorMessage.TIMEZONE_CONVERSION_FAILED);
  }
  return getCurrentTimeInTimezone(timezone);
};

/**
 * Create a date object for a specific time in a timezone
 */
export const createDateInTimezone = (
  dateStr: string,
  timeStr: string,
  timezone: string
): Date => {
  if (!isValidTimezone(timezone)) {
    throw new TimezoneError(ErrorMessage.TIMEZONE_CONVERSION_FAILED);
  }
  
  const { hours, minutes } = parseTimeString(timeStr);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  
  return convertTimezone(date, timezone, 'UTC');
};

