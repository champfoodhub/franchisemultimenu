import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate';
import { createSchedule, getSchedules, getScheduleById, updateSchedule, deleteSchedule, addScheduleItems, removeScheduleItem, getScheduleItems, getAvailableTimeSlots, } from '../controllers/schedule.controller';
import { createScheduleSchema, updateScheduleSchema, addScheduleItemsSchema, getScheduleItemsSchema, removeScheduleItemSchema, } from '../validators/schedule.schemas';
const router = Router();
// ============================================
// HQ Admin Routes
// ============================================
// Apply HQ admin authentication to all routes
router.use(authMiddleware);
router.use(allowRoles('HQ'));
// Schedule CRUD operations
router.post('/schedules', validate(createScheduleSchema), createSchedule);
router.get('/schedules', getSchedules);
router.get('/schedules/:id', getScheduleById);
router.put('/schedules/:id', validate(updateScheduleSchema), updateSchedule);
router.delete('/schedules/:id', deleteSchedule);
// Schedule Items management
router.get('/schedules/:schedule_id/items', validate(getScheduleItemsSchema), getScheduleItems);
router.post('/schedule-items', validate(addScheduleItemsSchema), addScheduleItems);
router.delete('/schedule-items/:item_id', validate(removeScheduleItemSchema), removeScheduleItem);
// Available time slots for a date
router.get('/time-slots', getAvailableTimeSlots);
// ============================================
// Branch Routes (separate router mounted in app.ts)
// Note: Branch routes have different middleware configuration
// ============================================
export default router;
