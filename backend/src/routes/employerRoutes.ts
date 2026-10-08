import { Router } from 'express';
import { EmployerController } from '../controllers/employerController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/profile', requireAuth, requireRole('EMPLOYER'), EmployerController.getProfile);
router.put('/profile', requireAuth, requireRole('EMPLOYER'), EmployerController.updateProfile);
router.get('/dashboard/stats', requireAuth, requireRole('EMPLOYER'), EmployerController.getDashboardStats);

export default router;
