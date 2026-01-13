/**
 * Unit tests for timezone utilities
 */
import {
  getDayOfWeek,
  parseTimeString,
  timeStringToDate,
  compareTimeStrings,
  isTimeInRange,
  isDateInRange,
  validateTimeRange,
  validateDateRange,
  parseQueryTime,
  parseQueryDate,
  isValidTimezone,
  isValidDayOfWeek,
  getDayName,
  TIMEZONES,
} from '../../src/utils/timezone';

describe('Timezone Utilities', () => {
  describe('getDayOfWeek', () => {
    it('should return 0 for Sunday', () => {
      const sunday = new Date('2024-03-03'); // March 3, 2024 is Sunday
      expect(getDayOfWeek(sunday)).toBe(0);
    });

    it('should return 1 for Monday', () => {
      const monday = new Date('2024-03-04'); // March 4, 2024 is Monday
      expect(getDayOfWeek(monday)).toBe(1);
    });

    it('should return 6 for Saturday', () => {
      const saturday = new Date('2024-03-02'); // March 2, 2024 is Saturday
      expect(getDayOfWeek(saturday)).toBe(6);
    });
  });

  describe('parseTimeString', () => {
    it('should parse HH:MM format', () => {
      const result = parseTimeString('12:30');
      expect(result).toEqual({ hours: 12, minutes: 30 });
    });

    it('should parse single digit hours', () => {
      const result = parseTimeString('6:05');
      expect(result).toEqual({ hours: 6, minutes: 5 });
    });

    it('should parse midnight', () => {
      const result = parseTimeString('00:00');
      expect(result).toEqual({ hours: 0, minutes: 0 });
    });

    it('should parse end of day', () => {
      const result = parseTimeString('23:59');
      expect(result).toEqual({ hours: 23, minutes: 59 });
    });
  });

  describe('timeStringToDate', () => {
    it('should convert time string to Date object', () => {
      const date = timeStringToDate('12:30');
      expect(date.getHours()).toBe(12);
      expect(date.getMinutes()).toBe(30);
    });

    it('should preserve date from provided date', () => {
      const baseDate = new Date('2024-03-15');
      const date = timeStringToDate('08:00', baseDate);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2); // March is 2 (0-indexed)
      expect(date.getDate()).toBe(15);
    });
  });

  describe('compareTimeStrings', () => {
    it('should return -1 when time1 < time2', () => {
      expect(compareTimeStrings('08:00', '12:00')).toBe(-1);
    });

    it('should return 0 when times are equal', () => {
      expect(compareTimeStrings('12:00', '12:00')).toBe(0);
    });

    it('should return 1 when time1 > time2', () => {
      expect(compareTimeStrings('14:00', '12:00')).toBe(1);
    });
  });

  describe('isTimeInRange', () => {
    it('should return true when time is within range', () => {
      expect(isTimeInRange('10:00', '08:00', '12:00')).toBe(true);
    });

    it('should return false when time is before range', () => {
      expect(isTimeInRange('07:00', '08:00', '12:00')).toBe(false);
    });

    it('should return false when time is after range', () => {
      expect(isTimeInRange('13:00', '08:00', '12:00')).toBe(false);
    });

    it('should return true at exact start time', () => {
      expect(isTimeInRange('08:00', '08:00', '12:00')).toBe(true);
    });

    it('should return true at exact end time', () => {
      expect(isTimeInRange('12:00', '08:00', '12:00')).toBe(true);
    });

    it('should handle overnight schedules (22:00 - 02:00)', () => {
      expect(isTimeInRange('23:00', '22:00', '02:00')).toBe(true);
      expect(isTimeInRange('01:00', '22:00', '02:00')).toBe(true);
      expect(isTimeInRange('03:00', '22:00', '02:00')).toBe(false);
      expect(isTimeInRange('20:00', '22:00', '02:00')).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    it('should return true when date is within range', () => {
      const current = new Date('2024-06-15');
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      expect(isDateInRange(current, start, end)).toBe(true);
    });

    it('should return false when date is before range', () => {
      const current = new Date('2024-01-01');
      const start = new Date('2024-02-01');
      const end = new Date('2024-12-31');
      expect(isDateInRange(current, start, end)).toBe(false);
    });

    it('should return false when date is after range', () => {
      const current = new Date('2024-12-31');
      const start = new Date('2024-01-01');
      const end = new Date('2024-06-30');
      expect(isDateInRange(current, start, end)).toBe(false);
    });

    it('should handle string dates', () => {
      expect(isDateInRange(new Date('2024-06-15'), '2024-01-01', '2024-12-31')).toBe(true);
    });
  });

  describe('validateTimeRange', () => {
    it('should return true for valid range', () => {
      expect(validateTimeRange('08:00', '12:00')).toBe(true);
    });

    it('should return false for empty times', () => {
      expect(validateTimeRange('', '12:00')).toBe(false);
      expect(validateTimeRange('08:00', '')).toBe(false);
    });

    it('should return false for same start and end time', () => {
      expect(validateTimeRange('12:00', '12:00')).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('should return true when end date is after start date', () => {
      expect(validateDateRange('2024-01-01', '2024-12-31')).toBe(true);
    });

    it('should return false when end date is before start date', () => {
      expect(validateDateRange('2024-12-31', '2024-01-01')).toBe(false);
    });

    it('should return false when dates are equal', () => {
      expect(validateDateRange('2024-06-15', '2024-06-15')).toBe(false);
    });
  });

  describe('parseQueryTime', () => {
    it('should parse valid HH:MM format', () => {
      expect(parseQueryTime('12:30')).toBe('12:30');
    });

    it('should parse valid HH:MM:SS format', () => {
      expect(parseQueryTime('12:30:45')).toBe('12:30');
    });

    it('should return null for invalid format', () => {
      expect(parseQueryTime('invalid')).toBeNull();
    });

    it('should return null for out of range hours', () => {
      expect(parseQueryTime('24:00')).toBeNull();
    });

    it('should return null for out of range minutes', () => {
      expect(parseQueryTime('12:60')).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(parseQueryTime(undefined)).toBeNull();
    });
  });

  describe('parseQueryDate', () => {
    it('should parse valid date string', () => {
      const result = parseQueryDate('2024-06-15');
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(5); // June is 5
      expect(result?.getDate()).toBe(15);
    });

    it('should return null for invalid date', () => {
      expect(parseQueryDate('invalid')).toBeNull();
    });

    it('should return null for invalid date format', () => {
      expect(parseQueryDate('15-06-2024')).toBeNull();
    });
  });

  describe('isValidTimezone', () => {
    it('should return true for valid timezones', () => {
      expect(isValidTimezone('UTC')).toBe(true);
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
    });

    it('should return false for invalid timezones', () => {
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
    });
  });

  describe('isValidDayOfWeek', () => {
    it('should return true for valid days', () => {
      for (let i = 0; i <= 6; i++) {
        expect(isValidDayOfWeek(i)).toBe(true);
      }
    });

    it('should return false for invalid days', () => {
      expect(isValidDayOfWeek(-1)).toBe(false);
      expect(isValidDayOfWeek(7)).toBe(false);
      expect(isValidDayOfWeek(10)).toBe(false);
    });
  });

  describe('getDayName', () => {
    it('should return correct day names', () => {
      expect(getDayName(0)).toBe('Sunday');
      expect(getDayName(1)).toBe('Monday');
      expect(getDayName(2)).toBe('Tuesday');
      expect(getDayName(3)).toBe('Wednesday');
      expect(getDayName(4)).toBe('Thursday');
      expect(getDayName(5)).toBe('Friday');
      expect(getDayName(6)).toBe('Saturday');
    });

    it('should return Unknown for invalid day', () => {
      expect(getDayName(7)).toBe('Unknown');
    });
  });

  describe('TIMEZONES', () => {
    it('should contain common timezones', () => {
      expect(TIMEZONES.UTC).toBe('UTC');
      expect(TIMEZONES['America/New_York']).toBeDefined();
      expect(TIMEZONES['Europe/London']).toBeDefined();
      expect(TIMEZONES['Asia/Tokyo']).toBeDefined();
    });
  });
});

