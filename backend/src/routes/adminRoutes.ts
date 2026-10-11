import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireAuth, requireRole('ADMIN'), AdminController.getStats);
router.get('/users', requireAuth, requireRole('ADMIN'), AdminController.getUsers);
router.patch('/users/:id/status', requireAuth, requireRole('ADMIN'), AdminController.toggleUserStatus);
router.get('/jobs', requireAuth, requireRole('ADMIN'), AdminController.getAllJobs);
router.patch('/jobs/:id/status', requireAuth, requireRole('ADMIN'), AdminController.toggleJobStatus);
router.delete('/jobs/:id', requireAuth, requireRole('ADMIN'), AdminController.deleteJob);
router.get('/applications', requireAuth, requireRole('ADMIN'), AdminController.getAllApplications);
router.get('/accessibility-reports', requireAuth, requireRole('ADMIN'), AdminController.getAccessibilityReports);
router.patch('/accessibility-reports/:id', requireAuth, requireRole('ADMIN'), AdminController.updateAccessibilityReport);
router.patch('/employers/:id/verify', requireAuth, requireRole('ADMIN'), AdminController.toggleEmployerVerification);

export default router;
