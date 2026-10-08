import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Candidate endpoints
router.post('/', requireAuth, requireRole('CANDIDATE'), ApplicationController.apply);
router.get('/my-applications', requireAuth, requireRole('CANDIDATE'), ApplicationController.getMyApplications);
router.post('/:id/withdraw', requireAuth, requireRole('CANDIDATE'), ApplicationController.withdrawApplication);

// Employer endpoints
router.get('/job-applications', requireAuth, requireRole('EMPLOYER'), ApplicationController.getJobApplications);
router.patch('/:id/status', requireAuth, requireRole('EMPLOYER'), ApplicationController.updateStatus);
router.post('/:id/notes', requireAuth, requireRole('EMPLOYER'), ApplicationController.addEmployerNote);

export default router;
