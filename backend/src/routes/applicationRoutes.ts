import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Candidate endpoints
router.post('/', requireAuth, requireRole('CANDIDATE'), ApplicationController.apply);
router.get('/my-applications', requireAuth, requireRole('CANDIDATE'), ApplicationController.getMyApplications);
router.post('/:id/withdraw', requireAuth, requireRole('CANDIDATE'), ApplicationController.withdrawApplication);
router.post('/:id/request-feedback', requireAuth, requireRole('CANDIDATE'), ApplicationController.requestFeedback);

// Employer endpoints
router.get('/job-applications', requireAuth, requireRole('EMPLOYER'), ApplicationController.getJobApplications);
router.patch('/:id/status', requireAuth, requireRole('EMPLOYER'), ApplicationController.updateStatus);
router.post('/:id/notes', requireAuth, requireRole('EMPLOYER'), ApplicationController.addEmployerNote);
router.post('/:id/feedback', requireAuth, requireRole('EMPLOYER'), ApplicationController.submitStructuredFeedback);
router.patch('/:id/checklist', requireAuth, requireRole('EMPLOYER'), ApplicationController.updateAccommodationChecklist);

export default router;
