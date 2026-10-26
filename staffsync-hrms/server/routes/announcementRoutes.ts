import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  toggleArchiveAnnouncement,
} from '../controllers/announcementController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { authorizeRoles } from '../middleware/roles.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAnnouncements);

// HR-only actions
router.post('/', authorizeRoles('HR Admin'), createAnnouncement);
router.put('/:id', authorizeRoles('HR Admin'), updateAnnouncement);
router.patch('/:id/archive', authorizeRoles('HR Admin'), toggleArchiveAnnouncement);

export default router;
