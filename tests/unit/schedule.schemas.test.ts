/**
 * Unit tests for schedule validation schemas
 */
import {
  createScheduleSchema,
  updateScheduleSchema,
  addScheduleItemsSchema,
  branchMenuQuerySchema,
  getScheduleItemsSchema,
  removeScheduleItemSchema,
} from '../../src/validators/schedule.schemas';

describe('Schedule Schemas', () => {
  describe('createScheduleSchema', () => {
    describe('TIME_SLOT type', () => {
      it('should validate valid time slot schedule', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Breakfast Menu',
          type: 'TIME_SLOT',
          start_time: '06:00',
          end_time: '11:00',
          timezone: 'UTC',
          day_of_week: [1, 2, 3, 4, 5],
        });
        expect(result.success).toBe(true);
      });

      it('should reject time slot without start_time', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Breakfast Menu',
          type: 'TIME_SLOT',
          end_time: '11:00',
          timezone: 'UTC',
        });
        expect(result.success).toBe(false);
      });

      it('should reject time slot without end_time', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Breakfast Menu',
          type: 'TIME_SLOT',
          start_time: '06:00',
          timezone: 'UTC',
        });
        expect(result.success).toBe(false);
      });

      it('should reject invalid time format', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Breakfast Menu',
          type: 'TIME_SLOT',
          start_time: '6:00', // Should be 06:00
          end_time: '11:00',
          timezone: 'UTC',
        });
        expect(result.success).toBe(false);
      });

      it('should reject invalid day of week values', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Breakfast Menu',
          type: 'TIME_SLOT',
          start_time: '06:00',
          end_time: '11:00',
          timezone: 'UTC',
          day_of_week: [1, 2, 7], // 7 is invalid
        });
        expect(result.success).toBe(false);
      });

      it('should reject empty day of week array', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Breakfast Menu',
          type: 'TIME_SLOT',
          start_time: '06:00',
          end_time: '11:00',
          timezone: 'UTC',
          day_of_week: [],
        });
        expect(result.success).toBe(false);
      });
    });

    describe('SEASONAL type', () => {
      it('should validate valid seasonal schedule', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Summer Specials 2024',
          type: 'SEASONAL',
          start_date: '2024-06-01',
          end_date: '2024-08-31',
          timezone: 'America/New_York',
        });
        expect(result.success).toBe(true);
      });

      it('should reject seasonal without start_date', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Summer Specials',
          type: 'SEASONAL',
          end_date: '2024-08-31',
          timezone: 'UTC',
        });
        expect(result.success).toBe(false);
      });

      it('should reject seasonal without end_date', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Summer Specials',
          type: 'SEASONAL',
          start_date: '2024-06-01',
          timezone: 'UTC',
        });
        expect(result.success).toBe(false);
      });

      it('should reject invalid date format', () => {
        const result = createScheduleSchema.safeParse({
          name: 'Summer Specials',
          type: 'SEASONAL',
          start_date: '06-01-2024', // Should be YYYY-MM-DD
          end_date: '2024-08-31',
          timezone: 'UTC',
        });
        expect(result.success).toBe(false);
      });
    });

    it('should use default timezone when not provided', () => {
      const result = createScheduleSchema.safeParse({
        name: 'Breakfast Menu',
        type: 'TIME_SLOT',
        start_time: '06:00',
        end_time: '11:00',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timezone).toBe('UTC');
      }
    });

    it('should use default is_active when not provided', () => {
      const result = createScheduleSchema.safeParse({
        name: 'Breakfast Menu',
        type: 'TIME_SLOT',
        start_time: '06:00',
        end_time: '11:00',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_active).toBe(true);
      }
    });

    it('should reject name that is too short', () => {
      const result = createScheduleSchema.safeParse({
        name: 'A',
        type: 'TIME_SLOT',
        start_time: '06:00',
        end_time: '11:00',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name that is too long', () => {
      const result = createScheduleSchema.safeParse({
        name: 'a'.repeat(101),
        type: 'TIME_SLOT',
        start_time: '06:00',
        end_time: '11:00',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateScheduleSchema', () => {
    it('should allow partial updates for time slot', () => {
      const result = updateScheduleSchema.safeParse({
        name: 'Updated Breakfast',
        start_time: '07:00',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty update', () => {
      const result = updateScheduleSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = updateScheduleSchema.safeParse({
        type: 'INVALID_TYPE',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid day of week in update', () => {
      const result = updateScheduleSchema.safeParse({
        day_of_week: [0, 1, 2, 8], // 8 is invalid
      });
      expect(result.success).toBe(false);
    });

    it('should allow updating is_active to false', () => {
      const result = updateScheduleSchema.safeParse({
        is_active: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('addScheduleItemsSchema', () => {
    it('should validate valid schedule items', () => {
      const result = addScheduleItemsSchema.safeParse({
        schedule_id: '123e4567-e89b-12d3-a456-426614174000',
        menu_item_ids: [
          '223e4567-e89b-12d3-a456-426614174001',
          '323e4567-e89b-12d3-a456-426614174002',
        ],
        priority: 1,
        is_featured: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid schedule_id UUID', () => {
      const result = addScheduleItemsSchema.safeParse({
        schedule_id: 'invalid-uuid',
        menu_item_ids: ['223e4567-e89b-12d3-a456-426614174001'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty menu_item_ids array', () => {
      const result = addScheduleItemsSchema.safeParse({
        schedule_id: '123e4567-e89b-12d3-a456-426614174000',
        menu_item_ids: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject too many menu items', () => {
      const result = addScheduleItemsSchema.safeParse({
        schedule_id: '123e4567-e89b-12d3-a456-426614174000',
        menu_item_ids: Array(51).fill('223e4567-e89b-12d3-a456-426614174001'),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUIDs in menu_item_ids', () => {
      const result = addScheduleItemsSchema.safeParse({
        schedule_id: '123e4567-e89b-12d3-a456-426614174000',
        menu_item_ids: ['invalid-uuid'],
      });
      expect(result.success).toBe(false);
    });

    it('should use default priority when not provided', () => {
      const result = addScheduleItemsSchema.safeParse({
        schedule_id: '123e4567-e89b-12d3-a456-426614174000',
        menu_item_ids: ['223e4567-e89b-12d3-a456-426614174001'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe(0);
      }
    });

    it('should use default is_featured when not provided', () => {
      const result = addScheduleItemsSchema.safeParse({
        schedule_id: '123e4567-e89b-12d3-a456-426614174000',
        menu_item_ids: ['223e4567-e89b-12d3-a456-426614174001'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_featured).toBe(false);
      }
    });
  });

  describe('branchMenuQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const result = branchMenuQuerySchema.safeParse({
        time: '12:30',
        date: '2024-03-15',
        schedule_type: 'TIME_SLOT',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty query (all optional)', () => {
      const result = branchMenuQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate time format with seconds', () => {
      const result = branchMenuQuerySchema.safeParse({
        time: '12:30:45',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format', () => {
      const result = branchMenuQuerySchema.safeParse({
        time: '12:60', // Invalid minutes
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = branchMenuQuerySchema.safeParse({
        date: '15-03-2024', // Should be YYYY-MM-DD
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid schedule_type', () => {
      const result = branchMenuQuerySchema.safeParse({
        schedule_type: 'INVALID',
      });
      expect(result.success).toBe(false);
    });

    it('should accept ALL schedule_type', () => {
      const result = branchMenuQuerySchema.safeParse({
        schedule_type: 'ALL',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getScheduleItemsSchema', () => {
    it('should validate valid schedule_id', () => {
      const result = getScheduleItemsSchema.safeParse({
        schedule_id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid schedule_id', () => {
      const result = getScheduleItemsSchema.safeParse({
        schedule_id: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('removeScheduleItemSchema', () => {
    it('should validate valid item_id', () => {
      const result = removeScheduleItemSchema.safeParse({
        item_id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid item_id', () => {
      const result = removeScheduleItemSchema.safeParse({
        item_id: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });
  });
});

