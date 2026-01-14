import { z } from 'zod';
/**
 * Schedule type enum
 */
export const scheduleTypeSchema = z.enum(['TIME_SLOT', 'SEASONAL']);
/**
 * Day of week validation helper
 */
const dayOfWeekSchema = z
    .array(z.number().min(0).max(6))
    .min(1, 'At least one day must be specified')
    .max(7, 'Maximum 7 days allowed');
/**
 * Create schedule validation schema (HQ)
 * Validates time slots (breakfast, lunch, dinner) and seasonal menus
 */
export const createScheduleSchema = z.discriminatedUnion('type', [
    // TIME_SLOT schedule schema
    z.object({
        name: z
            .string()
            .min(1, 'Schedule name is required')
            .min(2, 'Schedule name must be at least 2 characters')
            .max(100, 'Schedule name must be less than 100 characters'),
        type: z.literal('TIME_SLOT'),
        start_time: z
            .string()
            .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)')
            .min(1, 'Start time is required for TIME_SLOT schedules'),
        end_time: z
            .string()
            .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)')
            .min(1, 'End time is required for TIME_SLOT schedules'),
        timezone: z.string().optional().catch(() => 'UTC'),
        day_of_week: dayOfWeekSchema.min(1, 'At least one day of week is required'),
        is_active: z.boolean().optional().catch(() => true),
    }),
    // SEASONAL schedule schema
    z.object({
        name: z
            .string()
            .min(1, 'Schedule name is required')
            .min(2, 'Schedule name must be at least 2 characters')
            .max(100, 'Schedule name must be less than 100 characters'),
        type: z.literal('SEASONAL'),
        start_date: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
            .min(1, 'Start date is required for SEASONAL schedules'),
        end_date: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
            .min(1, 'End date is required for SEASONAL schedules'),
        timezone: z.string().optional().catch(() => 'UTC'),
        is_active: z.boolean().optional().catch(() => true),
    }),
]);
/**
 * Update schedule validation schema (HQ)
 * All fields are optional but validated if provided
 */
export const updateScheduleSchema = z.object({
    name: z
        .string()
        .min(2, 'Schedule name must be at least 2 characters')
        .max(100, 'Schedule name must be less than 100 characters')
        .optional(),
    type: scheduleTypeSchema.optional(),
    start_time: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)')
        .optional(),
    end_time: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)')
        .optional(),
    start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
        .optional(),
    end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
        .optional(),
    timezone: z.string().optional(),
    day_of_week: dayOfWeekSchema.optional(),
    is_active: z.boolean().optional(),
});
// Conditional validation for time slot updates
updateScheduleSchema.refine((data) => {
    // Only validate if both times are provided
    if (data.start_time && data.end_time) {
        const start = data.start_time.split(':').map(Number);
        const end = data.end_time.split(':').map(Number);
        const startMins = start[0] * 60 + start[1];
        const endMins = end[0] * 60 + end[1];
        // Allow overnight schedules (e.g., 22:00 - 02:00)
        if (endMins <= startMins && endMins !== 0) {
            return true;
        }
        return endMins > startMins;
    }
    return true;
}, {
    message: 'End time must be after start time',
    path: ['end_time'],
});
// Conditional validation for seasonal updates
updateScheduleSchema.refine((data) => {
    // Only validate if both dates are provided
    if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        return end > start;
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['end_date'],
});
/**
 * Add items to schedule validation schema (HQ)
 */
export const addScheduleItemsSchema = z.object({
    schedule_id: z
        .string()
        .uuid('Invalid schedule ID format'),
    menu_item_ids: z
        .array(z.string().uuid('Each item ID must be a valid UUID'))
        .min(1, 'At least one menu item ID is required')
        .max(50, 'Maximum 50 items can be added at once'),
    priority: z.number().int().min(0).max(100).default(0),
    is_featured: z.boolean().default(false),
});
/**
 * Query parameters for getting time-based menu (Branch)
 */
export const branchMenuQuerySchema = z.object({
    time: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (use HH:MM or HH:MM:SS)')
        .optional(),
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
        .optional(),
    timezone: z.string().optional(),
    schedule_type: z.enum(['TIME_SLOT', 'SEASONAL', 'ALL']).optional(),
    include_inactive: z.boolean().optional(),
});
/**
 * Get schedule items query schema
 */
export const getScheduleItemsSchema = z.object({
    schedule_id: z.string().uuid('Invalid schedule ID format'),
});
/**
 * Remove schedule item schema
 */
export const removeScheduleItemSchema = z.object({
    item_id: z.string().uuid('Invalid item ID format'),
});
