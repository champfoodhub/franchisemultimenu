import { supabase } from '../config/supabase';
import { success, error } from '../utils/response';
import { ErrorMessage, SuccessMessage } from '../utils/errormessage';
import { validateTimeRange, validateDateRange, parseQueryTime, parseQueryDate, isTimeInRange, isDateInRange, getDayOfWeek, getCurrentTimeInTimezone, } from '../utils/timezone';
/**
 * Create a new menu schedule (HQ only)
 * Supports time slots (breakfast, lunch, dinner) and seasonal menus
 */
export const createSchedule = async (req, res) => {
    const scheduleData = req.body;
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
    const { data, error: err } = await supabase
        .from('menu_schedules')
        .insert({
        hq_id: req.user.hq_id,
        name: scheduleData.name,
        type: scheduleData.type,
        start_time: scheduleData.start_time || null,
        end_time: scheduleData.end_time || null,
        start_date: scheduleData.start_date || null,
        end_date: scheduleData.end_date || null,
        timezone: scheduleData.timezone,
        day_of_week: scheduleData.day_of_week || null,
        is_active: scheduleData.is_active ?? true,
    })
        .select()
        .single();
    if (err) {
        return error(res, ErrorMessage.SCHEDULE_CREATION_FAILED, 400);
    }
    return success(res, data, SuccessMessage.SCHEDULE_CREATED);
};
/**
 * Get all schedules for HQ (HQ only)
 */
export const getSchedules = async (req, res) => {
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    const { type, is_active } = req.query;
    let query = supabase
        .from('menu_schedules')
        .select('*')
        .eq('hq_id', req.user.hq_id)
        .order('created_at', { ascending: false });
    if (type) {
        query = query.eq('type', type);
    }
    if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true');
    }
    const { data, error: err } = await query;
    if (err) {
        return error(res, err.message, 400);
    }
    return success(res, data, SuccessMessage.SCHEDULE_RETRIEVED);
};
/**
 * Get single schedule by ID (HQ only)
 */
export const getScheduleById = async (req, res) => {
    const { id } = req.params;
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    const { data, error: err } = await supabase
        .from('menu_schedules')
        .select('*')
        .eq('id', id)
        .eq('hq_id', req.user.hq_id)
        .single();
    if (err || !data) {
        return error(res, ErrorMessage.SCHEDULE_NOT_FOUND, 404);
    }
    return success(res, data, SuccessMessage.SCHEDULE_RETRIEVED);
};
/**
 * Update a schedule (HQ only)
 */
export const updateSchedule = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
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
    const { data, error: err } = await supabase
        .from('menu_schedules')
        .update(updateData)
        .eq('id', id)
        .eq('hq_id', req.user.hq_id)
        .select()
        .single();
    if (err || !data) {
        return error(res, ErrorMessage.SCHEDULE_UPDATE_FAILED, 400);
    }
    return success(res, data, SuccessMessage.SCHEDULE_UPDATED);
};
/**
 * Delete a schedule (HQ only)
 */
export const deleteSchedule = async (req, res) => {
    const { id } = req.params;
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    // First, delete associated schedule items
    const { error: itemsErr } = await supabase
        .from('menu_schedule_items')
        .delete()
        .eq('schedule_id', id);
    if (itemsErr) {
        return error(res, ErrorMessage.SCHEDULE_DELETION_FAILED, 400);
    }
    // Then delete the schedule
    const { error: err } = await supabase
        .from('menu_schedules')
        .delete()
        .eq('id', id)
        .eq('hq_id', req.user.hq_id);
    if (err) {
        return error(res, ErrorMessage.SCHEDULE_DELETION_FAILED, 400);
    }
    return success(res, null, SuccessMessage.SCHEDULE_DELETED);
};
/**
 * Add items to a schedule (HQ only)
 */
export const addScheduleItems = async (req, res) => {
    const { schedule_id, menu_item_ids, priority, is_featured } = req.body;
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    // Verify schedule belongs to this HQ
    const { data: schedule, error: scheduleErr } = await supabase
        .from('menu_schedules')
        .select('id')
        .eq('id', schedule_id)
        .eq('hq_id', req.user.hq_id)
        .single();
    if (scheduleErr || !schedule) {
        return error(res, ErrorMessage.SCHEDULE_NOT_FOUND, 404);
    }
    // Prepare items for insertion
    const itemsToInsert = menu_item_ids.map((menuItemId) => ({
        schedule_id,
        menu_item_id: menuItemId,
        priority: priority ?? 0,
        is_featured: is_featured ?? false,
    }));
    const { data, error: err } = await supabase
        .from('menu_schedule_items')
        .insert(itemsToInsert)
        .select();
    if (err) {
        return error(res, ErrorMessage.SCHEDULE_ITEM_CREATION_FAILED, 400);
    }
    return success(res, data, SuccessMessage.SCHEDULE_ITEMS_ADDED);
};
/**
 * Remove an item from a schedule (HQ only)
 */
export const removeScheduleItem = async (req, res) => {
    const { item_id } = req.params;
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    // Get the schedule item to verify ownership
    const { data: scheduleItem, error: itemErr } = await supabase
        .from('menu_schedule_items')
        .select('id, schedule_id')
        .eq('id', item_id)
        .single();
    if (itemErr || !scheduleItem) {
        return error(res, ErrorMessage.SCHEDULE_ITEM_NOT_FOUND, 404);
    }
    // Verify schedule belongs to this HQ
    const { data: schedule, error: scheduleErr } = await supabase
        .from('menu_schedules')
        .select('id')
        .eq('id', scheduleItem.schedule_id)
        .eq('hq_id', req.user.hq_id)
        .single();
    if (scheduleErr || !schedule) {
        return error(res, ErrorMessage.FORBIDDEN, 403);
    }
    // Delete the schedule item
    const { error: err } = await supabase
        .from('menu_schedule_items')
        .delete()
        .eq('id', item_id);
    if (err) {
        return error(res, ErrorMessage.SCHEDULE_ITEM_DELETION_FAILED, 400);
    }
    return success(res, null, SuccessMessage.SCHEDULE_ITEMS_REMOVED);
};
/**
 * Get items in a schedule (HQ only)
 */
export const getScheduleItems = async (req, res) => {
    const { schedule_id } = req.params;
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    // Verify schedule belongs to this HQ
    const { data: schedule, error: scheduleErr } = await supabase
        .from('menu_schedules')
        .select('id')
        .eq('id', schedule_id)
        .eq('hq_id', req.user.hq_id)
        .single();
    if (scheduleErr || !schedule) {
        return error(res, ErrorMessage.SCHEDULE_NOT_FOUND, 404);
    }
    const { data, error: err } = await supabase
        .from('menu_schedule_items')
        .select(`
      *,
      menu_items:menu_item_id (
        id,
        name,
        price,
        category,
        is_active
      )
    `)
        .eq('schedule_id', schedule_id)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });
    if (err) {
        return error(res, err.message, 400);
    }
    return success(res, data, SuccessMessage.SCHEDULE_RETRIEVED);
};
/**
 * Get time-based menu for branch (Branch or HQ)
 * Returns active menu items based on current time or specified time
 */
export const getTimeBasedMenu = async (req, res) => {
    // Get branch timezone (default to UTC if not specified)
    const branchTimezone = req.user?.timezone || 'UTC';
    // Parse query parameters
    const timeParam = parseQueryTime(req.query.time);
    const dateParam = parseQueryDate(req.query.date);
    const scheduleTypeFilter = req.query.schedule_type;
    // Use current time if not specified
    const now = dateParam || new Date();
    const currentTime = timeParam || now.toTimeString().slice(0, 5);
    // Get HQ ID from either HQ user or Branch user
    const hqId = req.user?.hq_id;
    const branchId = req.user?.branch_id;
    if (!hqId && !branchId) {
        return error(res, ErrorMessage.FORBIDDEN, 403);
    }
    // Get HQ ID from branch if needed
    const targetHqId = hqId || branchId;
    // Get all active schedules for this HQ
    let schedulesQuery = supabase
        .from('menu_schedules')
        .select('*')
        .eq('hq_id', targetHqId)
        .eq('is_active', true);
    if (scheduleTypeFilter && scheduleTypeFilter !== 'ALL') {
        schedulesQuery = schedulesQuery.eq('type', scheduleTypeFilter);
    }
    const { data: schedules, error: schedulesErr } = await schedulesQuery;
    if (schedulesErr) {
        return error(res, schedulesErr.message, 400);
    }
    if (!schedules || schedules.length === 0) {
        return success(res, [], SuccessMessage.MENU_RETRIEVED);
    }
    // Filter schedules based on current time/date and timezone
    const activeSchedules = schedules.filter((schedule) => {
        if (schedule.type === 'TIME_SLOT') {
            // Convert current time to schedule timezone for comparison
            const scheduleTime = getCurrentTimeInTimezone(schedule.timezone);
            const scheduleTimeStr = scheduleTime.toTimeString().slice(0, 5);
            // Check if current time is within the time slot
            if (!isTimeInRange(scheduleTimeStr, schedule.start_time, schedule.end_time)) {
                return false;
            }
            // Check day of week if specified
            if (schedule.day_of_week && schedule.day_of_week.length > 0) {
                const currentDay = getDayOfWeek(now);
                return schedule.day_of_week.includes(currentDay);
            }
            return true;
        }
        else if (schedule.type === 'SEASONAL') {
            // Check if current date is within seasonal range
            return isDateInRange(now, schedule.start_date, schedule.end_date);
        }
        return false;
    });
    if (activeSchedules.length === 0) {
        return success(res, [], SuccessMessage.MENU_RETRIEVED);
    }
    // Get menu items from active schedules
    const activeScheduleIds = activeSchedules.map((s) => s.id);
    const { data: menuItems, error: menuErr } = await supabase
        .from('menu_schedule_items')
        .select(`
      *,
      menu_items:menu_item_id (
        id,
        name,
        price,
        category,
        is_active,
        description
      ),
      schedules:schedule_id (
        id,
        name,
        type,
        timezone
      )
    `)
        .in('schedule_id', activeScheduleIds)
        .eq('menu_items.is_active', true)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });
    if (menuErr) {
        return error(res, menuErr.message, 400);
    }
    // Group items by schedule for clarity
    const result = activeSchedules.map((schedule) => {
        const scheduleItems = menuItems?.filter((item) => item.schedule_id === schedule.id) || [];
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
        timezone: branchTimezone,
        active_schedules: result.length,
        schedules: result,
    }, SuccessMessage.MENU_RETRIEVED);
};
/**
 * Get available time slots for a specific date (HQ)
 */
export const getAvailableTimeSlots = async (req, res) => {
    const dateParam = parseQueryDate(req.query.date);
    const targetDate = dateParam || new Date();
    const targetDay = getDayOfWeek(targetDate);
    if (!req.user?.hq_id) {
        return error(res, ErrorMessage.HQ_NOT_ASSIGNED, 403);
    }
    const { data: schedules, error: err } = await supabase
        .from('menu_schedules')
        .select('*')
        .eq('hq_id', req.user.hq_id)
        .eq('type', 'TIME_SLOT')
        .eq('is_active', true);
    if (err) {
        return error(res, err.message, 400);
    }
    // Filter schedules that include the target day
    const availableSlots = schedules
        .filter((schedule) => {
        if (!schedule.day_of_week || schedule.day_of_week.length === 0) {
            return true;
        }
        return schedule.day_of_week.includes(targetDay);
    })
        .map((schedule) => ({
        schedule_id: schedule.id,
        schedule_name: schedule.name,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        timezone: schedule.timezone,
    }))
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return success(res, {
        date: targetDate.toISOString().split('T')[0],
        day_name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDay],
        available_slots: availableSlots,
    }, SuccessMessage.SCHEDULE_RETRIEVED);
};
