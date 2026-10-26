import { Router } from 'express';
import {
  getTrainings,
  createTraining,
  updateTraining,
  enrollInTraining,
  getParticipants,
  getMyEnrollments,
} from '../controllers/trainingController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { authorizeRoles } from '../middleware/roles.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getTrainings);
router.get('/my-enrollments', getMyEnrollments);
router.post('/:id/enroll', enrollInTraining);

// Privileged routes
router.get('/:id/participants', authorizeRoles('HR Admin', 'Manager'), getParticipants);
router.post('/', authorizeRoles('HR Admin'), createTraining);
router.put('/:id', authorizeRoles('HR Admin'), updateTraining);

export default router;
