import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/mysql';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  AddScheduleItemsInput,
} from '../validators/schedule.schemas';
import {
  validateTimeRange,
  validateDateRange,
} from '../utils/timezone';

// Define interfaces
interface MenuSchedule {
  id: number;
  hq_id: number;
  name: string;
  type: 'TIME_SLOT' | 'SEASONAL';
  start_time: string | null;
  end_time: string | null;
  start_date: string | null;
  end_date: string | null;
  timezone: string;
  day_of_week: string | null; // JSON string
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface MenuScheduleItem {
  id: number;
  schedule_id: number;
  menu_item_id: number;
  priority: number;
  is_featured: boolean;
  created_at: Date;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string | null;
  description: string | null;
  is_active: boolean;
}

/**
 * Create a new menu schedule (HQ only)
 * Supports time slots (breakfast, lunch, dinner) and seasonal menus
 */
export const createSchedule = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const scheduleData = req.body as CreateScheduleInput;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  // Validate time range for TIME_SLOT
  if (scheduleData.type === 'TIME_SLOT' && scheduleData.start_time && scheduleData.end_time) {
    if (!validateTimeRange(scheduleData.start_time, scheduleData.end_time)) {
      return error(res, ErrorMessage.INVALID_TIME_RANGE, 400);
    }
  }

  // Validate date range for SEASONAL
  if (scheduleData.type === 'SEASONAL' && scheduleData.start_date && scheduleData.end_date) {
    if (!validateDateRange(scheduleData.start_date, scheduleData.end_date)) {
      return error(res, ErrorMessage.INVALID_DATE_RANGE, 400);
    }
  }

  try {
    // Convert day_of_week array to JSON string
    const dayOfWeekJson = scheduleData.day_of_week 
      ? JSON.stringify(scheduleData.day_of_week) 
      : null;

    const result = await execute(
      `INSERT INTO menu_schedules 
       (hq_id, name, type, start_time, end_time, start_date, end_date, timezone, day_of_week, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.hq_id,
        scheduleData.name,
        scheduleData.type,
        scheduleData.start_time || null,
        scheduleData.end_time || null,
        scheduleData.start_date || null,
        scheduleData.end_date || null,
        scheduleData.timezone || 'UTC',
        dayOfWeekJson,
        scheduleData.is_active ?? true,
      ]
    );

    const schedule = await queryOne<MenuSchedule>(
      `SELECT * FROM menu_schedules WHERE id = ?`,
      [result.insertId]
    );

    return success(res, schedule, SuccessMessage.SCHEDULE_CREATED);
  } catch (err) {
    console.error('Create schedule error:', err);
    return error(res, ErrorMessage.SCHEDULE_CREATION_FAILED, 500);
  }
};

/**
 * Get all schedules for HQ (HQ only)
 */
export const getSchedules = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  const { type, is_active } = req.query;

  try {
    let sql = `SELECT * FROM menu_schedules WHERE hq_id = ?`;
    const params: any[] = [req.user.hq_id];

    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    if (is_active !== undefined) {
      sql += ` AND is_active = ?`;
      params.push(is_active === 'true');
    }

    sql += ` ORDER BY created_at DESC`;

    const schedules = await query<MenuSchedule>(sql, params);

    // Parse day_of_week JSON for each schedule
    const parsedSchedules = schedules.map((s: any) => ({
      ...s,
      day_of_week: s.day_of_week ? JSON.parse(s.day_of_week) : null,
    }));

    return success(res, parsedSchedules, SuccessMessage.SCHEDULE_RETRIEVED);
  } catch (err) {
    console.error('Get schedules error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get single schedule by ID (HQ only)
 */
export const getScheduleById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    const schedule = await queryOne<MenuSchedule>(
      `SELECT * FROM menu_schedules WHERE id = ? AND hq_id = ?`,
      [id, req.user.hq_id]
    );

    if (!schedule) {
      return error(res, ErrorMessage.SCHEDULE_NOT_FOUND, 404);
    }

    // Parse day_of_week JSON
    const parsedSchedule = {
      ...schedule,
      day_of_week: schedule.day_of_week ? JSON.parse(schedule.day_of_week) : null,
    };

    return success(res, parsedSchedule, SuccessMessage.SCHEDULE_RETRIEVED);
  } catch (err) {
    console.error('Get schedule by ID error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Update a schedule (HQ only)
 */
export const updateSchedule = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const updateData = req.body as UpdateScheduleInput;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  // Validate time range if both times provided
  if (updateData.start_time && updateData.end_time) {
    if (!validateTimeRange(updateData.start_time, updateData.end_time)) {
      return error(res, ErrorMessage.INVALID_TIME_RANGE, 400);
    }
  }

  // Validate date range if both dates provided
  if (updateData.start_date && updateData.end_date) {
    if (!validateDateRange(updateData.start_date, updateData.end_date)) {
      return error(res, ErrorMessage.INVALID_DATE_RANGE, 400);
    }
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.name !== undefined) {
      updates.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.type !== undefined) {
      updates.push('type = ?');
      values.push(updateData.type);
    }
    if (updateData.start_time !== undefined) {
      updates.push('start_time = ?');
      values.push(updateData.start_time);
    }
    if (updateData.end_time !== undefined) {
      updates.push('end_time = ?');
      values.push(updateData.end_time);
    }
    if (updateData.start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(updateData.start_date);
    }
    if (updateData.end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(updateData.end_date);
    }
    if (updateData.timezone !== undefined) {
      updates.push('timezone = ?');
      values.push(updateData.timezone);
    }
    if (updateData.day_of_week !== undefined) {
      updates.push('day_of_week = ?');
      values.push(JSON.stringify(updateData.day_of_week));
    }
    if (updateData.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(updateData.is_active);
    }

    if (updates.length === 0) {
      return error(res, ErrorMessage.BAD_REQUEST, 400);
    }

    values.push(id, req.user.hq_id);

    await execute(
      `UPDATE menu_schedules SET ${updates.join(', ')} WHERE id = ? AND hq_id = ?`,
      values
    );

    const schedule = await queryOne<MenuSchedule>(
      `SELECT * FROM menu_schedules WHERE id = ?`,
      [id]
    );

    if (!schedule) {
      return error(res, ErrorMessage.SCHEDULE_NOT_FOUND, 404);
    }

    return success(res, schedule, SuccessMessage.SCHEDULE_UPDATED);
  } catch (err) {
    console.error('Update schedule error:', err);
    return error(res, ErrorMessage.SCHEDULE_UPDATE_FAILED, 500);
  }
};

/**
 * Delete a schedule (HQ only)
 */
export const deleteSchedule = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    // First, delete associated schedule items
    await execute(
      `DELETE FROM menu_schedule_items WHERE schedule_id = ?`,
      [id]
    );

    // Then delete the schedule
    const result = await execute(
      `DELETE FROM menu_schedules WHERE id = ? AND hq_id = ?`,
      [id, req.user.hq_id]
    );

    if (result.affectedRows === 0) {
      return error(res, ErrorMessage.SCHEDULE_NOT_FOUND, 404);
    }

    return success(res, null, SuccessMessage.SCHEDULE_DELETED);
  } catch (err) {
    console.error('Delete schedule error:', err);
    return error(res, ErrorMessage.SCHEDULE_DELETION_FAILED, 500);
  }
};

/**
 * Add items to a schedule (HQ only)
 */
export const addScheduleItems = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { schedule_id, menu_item_ids, priority, is_featured } = req.body as AddScheduleItemsInput;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    // Verify schedule belongs to this HQ
    const schedule = await queryOne<MenuSchedule>(
      `SELECT id FROM menu_schedules WHERE id = ? AND hq_id = ?`,
      [schedule_id, req.user.hq_id]
    );

    if (!schedule) {
      return error(res, ErrorMessage.SCHEDULE_NOT_FOUND, 404);
    }

    // Prepare items for insertion
    const itemsToInsert = menu_item_ids.map((menuItemId: number) => ({
      schedule_id,
      menu_item_id: menuItemId,
      priority: priority ?? 0,
      is_featured: is_featured ?? false,
    }));

    // Insert items
    for (const item of itemsToInsert) {
      await execute(
        `INSERT INTO menu_schedule_items (schedule_id, menu_item_id, priority, is_featured) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE priority = VALUES(priority), is_featured = VALUES(is_featured)`,
        [item.schedule_id, item.menu_item_id, item.priority, item.is_featured]
      );
    }

    const items = await query<any>(
      `SELECT msi.*, m.name as menu_item_name, m.price, m.category
       FROM menu_schedule_items msi
       JOIN menu m ON msi.menu_item_id = m.id
       WHERE msi.schedule_id = ?`,
      [schedule_id]
    );

    return success(res, items, SuccessMessage.SCHEDULE_ITEMS_ADDED);
  } catch (err) {
    console.error('Add schedule items error:', err);
    return error(res, ErrorMessage.SCHEDULE_ITEM_CREATION_FAILED, 500);
  }
};

/**
 * Remove an item from a schedule (HQ only)
 */
export const removeScheduleItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { item_id } = req.params;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    // Get the schedule item to verify ownership
    const scheduleItem = await queryOne<MenuScheduleItem>(
      `SELECT msi.*, ms.hq_id 
       FROM menu_schedule_items msi
       JOIN menu_schedules ms ON msi.schedule_id = ms.id
       WHERE msi.id = ?`,
      [item_id]
    );

    if (!scheduleItem) {
      return error(res, ErrorMessage.SCHEDULE_ITEM_NOT_FOUND, 404);
    }

    if (scheduleItem.hq_id !== req.user.hq_id) {
      return error(res, ErrorMessage.FORBIDDEN, 403);
    }

    // Delete the schedule item
    await execute(`DELETE FROM menu_schedule_items WHERE id = ?`, [item_id]);

    return success(res, null, SuccessMessage.SCHEDULE_ITEMS_REMOVED);
  } catch (err) {
    console.error('Remove schedule item error:', err);
    return error(res, ErrorMessage.SCHEDULE_ITEM_DELETION_FAILED, 500);
  }
};

/**
 * Get items in a schedule (HQ only)
 */
export const getScheduleItems = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { schedule_id } = req.params;

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    // Verify schedule belongs to this HQ
    const schedule = await queryOne<MenuSchedule>(
      `SELECT id FROM menu_schedules WHERE id = ? AND hq_id = ?`,
      [schedule_id, req.user.hq_id]
    );

    if (!schedule) {
      return error(res, ErrorMessage.SCHEDULE_NOT_FOUND, 404);
    }

    const items = await query<any>(
      `SELECT 
        msi.*,
        m.id as menu_item_id,
        m.name as menu_item_name,
        m.price,
        m.category,
        m.is_active
       FROM menu_schedule_items msi
       JOIN menu m ON msi.menu_item_id = m.id
       WHERE msi.schedule_id = ?
       ORDER BY msi.priority ASC, msi.created_at ASC`,
      [schedule_id]
    );

    return success(res, items, SuccessMessage.SCHEDULE_RETRIEVED);
  } catch (err) {
    console.error('Get schedule items error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get time-based menu for branch (Branch or HQ)
 * Returns active menu items based on current time or specified time
 */
export const getTimeBasedMenu = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Parse query parameters
  const timeParam = req.query.time as string;
  const dateParam = req.query.date as string;
  const scheduleTypeFilter = (req.query.schedule_type as string) || 'ALL';

  // Use current time if not specified
  const now = dateParam ? new Date(dateParam) : new Date();
  const currentTime = timeParam || now.toTimeString().slice(0, 5);

  // Get HQ ID from either HQ user or Branch user
  const hqId = req.user?.hq_id;
  const branchId = req.user?.branch_id;

  if (!hqId && !branchId) {
    return error(res, ErrorMessage.FORBIDDEN, 403);
  }

  // Get HQ ID from branch if needed
  const targetHqId = hqId || branchId;

  try {
    // Get all active schedules for this HQ
    let sql = `SELECT * FROM menu_schedules WHERE hq_id = ? AND is_active = true`;
    const params: any[] = [targetHqId];

    if (scheduleTypeFilter && scheduleTypeFilter !== 'ALL') {
      sql += ` AND type = ?`;
      params.push(scheduleTypeFilter);
    }

    const schedules = await query<MenuSchedule>(sql, params);

    if (!schedules || schedules.length === 0) {
      return success(res, [], SuccessMessage.MENU_RETRIEVED);
    }

    // Filter schedules based on current time/date
    const activeSchedules = schedules.filter((schedule: any) => {
      if (schedule.type === 'TIME_SLOT') {
        // Check if current time is within the time slot
        if (!isTimeInRange(currentTime, schedule.start_time, schedule.end_time)) {
          return false;
        }

        // Check day of week if specified
        if (schedule.day_of_week) {
          const dayOfWeek = JSON.parse(schedule.day_of_week);
          const currentDay = now.getDay();
          if (dayOfWeek.length > 0 && !dayOfWeek.includes(currentDay)) {
            return false;
          }
        }

        return true;
      } else if (schedule.type === 'SEASONAL') {
        // Check if current date is within seasonal range
        const currentDateStr = now.toISOString().split('T')[0];
        return (
          currentDateStr >= schedule.start_date &&
          currentDateStr <= schedule.end_date
        );
      }

      return false;
    });

    if (activeSchedules.length === 0) {
      return success(res, [], SuccessMessage.MENU_RETRIEVED);
    }

    // Get menu items from active schedules
    const activeScheduleIds = activeSchedules.map((s: any) => s.id);

    const menuItems = await query<any>(
      `SELECT 
        msi.*,
        m.id as menu_item_id,
        m.name as menu_item_name,
        m.price as menu_item_price,
        m.category as menu_item_category,
        m.description as menu_item_description
       FROM menu_schedule_items msi
       JOIN menu m ON msi.menu_item_id = m.id
       WHERE msi.schedule_id IN (${activeScheduleIds.map(() => '?').join(',')})
         AND m.is_active = true
       ORDER BY msi.priority ASC, msi.created_at ASC`,
      activeScheduleIds
    );

    // Group items by schedule for clarity
    const result = activeSchedules.map((schedule: any) => {
      const scheduleItems = menuItems.filter(
        (item: any) => item.schedule_id === schedule.id
      );

      return {
        schedule: {
          id: schedule.id,
          name: schedule.name,
          type: schedule.type,
          timezone: schedule.timezone,
        },
        items: scheduleItems,
        itemCount: scheduleItems.length,
      };
    });

    return success(res, {
      current_time: currentTime,
      current_date: now.toISOString().split('T')[0],
      active_schedules: result.length,
      schedules: result,
    }, SuccessMessage.MENU_RETRIEVED);
  } catch (err) {
    console.error('Get time-based menu error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

/**
 * Get available time slots for a specific date (HQ)
 */
export const getAvailableTimeSlots = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const dateParam = req.query.date as string;
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  const targetDay = targetDate.getDay();

  if (!req.user?.hq_id) {
    return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
  }

  try {
    const schedules = await query<MenuSchedule>(
      `SELECT * FROM menu_schedules 
       WHERE hq_id = ? AND type = 'TIME_SLOT' AND is_active = true`,
      [req.user.hq_id]
    );

    // Filter schedules that include the target day
    const availableSlots = schedules
      .filter((schedule: any) => {
        if (!schedule.day_of_week) {
          return true;
        }
        const dayOfWeek = JSON.parse(schedule.day_of_week);
        return dayOfWeek.length === 0 || dayOfWeek.includes(targetDay);
      })
      .map((schedule: any) => ({
        schedule_id: schedule.id,
        schedule_name: schedule.name,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        timezone: schedule.timezone,
      }))
      .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));

    return success(res, {
      date: targetDate.toISOString().split('T')[0],
      day_name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDay],
      available_slots: availableSlots,
    }, SuccessMessage.SCHEDULE_RETRIEVED);
  } catch (err) {
    console.error('Get available time slots error:', err);
    return error(res, ErrorMessage.SERVER_ERROR, 500);
  }
};

// Helper function to check if time is in range
function isTimeInRange(current: string, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  return current >= start && current <= end;
}

