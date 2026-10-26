import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getAllAttendanceRecords,
} from '../controllers/attendanceController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { authorizeRoles } from '../middleware/roles.ts';

const router = Router();

router.use(authenticateToken);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyAttendanceHistory);

// Manager & HR Admin view for organizational attendance records
router.get('/all', authorizeRoles('HR Admin', 'Manager'), getAllAttendanceRecords);

export default router;
