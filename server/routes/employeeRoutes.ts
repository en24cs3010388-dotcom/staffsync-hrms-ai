import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
} from '../controllers/employeeController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { authorizeRoles } from '../middleware/roles.ts';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Directory view - accessible to all authenticated employees, managers, HR admins
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

// HR-only management operations
router.post('/', authorizeRoles('HR Admin'), createEmployee);
router.put('/:id', authorizeRoles('HR Admin'), updateEmployee);
router.patch('/:id/status', authorizeRoles('HR Admin'), toggleEmployeeStatus);

export default router;
