import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { authorizeRoles } from '../middleware/roles.ts';

const router = Router();

router.use(authenticateToken);

router.post('/', applyLeave);
router.get('/my-requests', getMyLeaves);

// Manager & HR Admin routes to review team leave requests
router.get('/', authorizeRoles('HR Admin', 'Manager'), getAllLeaves);
router.patch('/:id/status', authorizeRoles('HR Admin', 'Manager'), updateLeaveStatus);

export default router;
