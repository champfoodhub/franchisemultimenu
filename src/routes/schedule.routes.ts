import { Router } from 'express';
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  addScheduleItems,
  removeScheduleItem,
  getScheduleItems,
  getTimeBasedMenu,
  getAvailableTimeSlots,
} from '../controllers/schedule.controller';
import { authMiddleware, requireHQ, requireBranch } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  createScheduleSchema,
  updateScheduleSchema,
  addScheduleItemsSchema,
} from '../validators/schedule.schemas';

const router = Router();

// Schedule routes for HQ
router.use(authMiddleware);

// HQ-only schedule routes
router.post('/schedules', requireHQ, validate(createScheduleSchema), createSchedule);
router.get('/schedules', requireHQ, getSchedules);
router.get('/schedules/:id', requireHQ, getScheduleById);
router.put('/schedules/:id', requireHQ, validate(updateScheduleSchema), updateSchedule);
router.delete('/schedules/:id', requireHQ, deleteSchedule);

// Schedule items routes (HQ only)
router.post('/schedules/:schedule_id/items', requireHQ, validate(addScheduleItemsSchema), addScheduleItems);
router.get('/schedules/:schedule_id/items', requireHQ, getScheduleItems);
router.delete('/schedules/items/:item_id', requireHQ, removeScheduleItem);

// Time-based menu (HQ or Branch)
router.get('/time-based-menu', getTimeBasedMenu);

// Available time slots (HQ only)
router.get('/time-slots', requireHQ, getAvailableTimeSlots);

export default router;

