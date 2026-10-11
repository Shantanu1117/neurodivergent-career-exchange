import { Router } from 'express';
import { JobController } from '../controllers/jobController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = Router();

// Public / Guest / Candidate browsing with dynamic match score calculation
router.get('/', optionalAuth, JobController.getJobs);
router.get('/employer/my-jobs', requireAuth, requireRole('EMPLOYER'), JobController.getEmployerJobs);
router.get('/candidate/saved', requireAuth, requireRole('CANDIDATE'), JobController.getSavedJobs);
router.get('/:id', optionalAuth, JobController.getJobById);

// Candidate Actions
router.post('/:id/save', requireAuth, requireRole('CANDIDATE'), JobController.toggleSaveJob);

// Employer Actions & Inclusivity Linter
router.post('/analyze-inclusivity', optionalAuth, JobController.analyzeJobInclusivity);
router.post('/', requireAuth, requireRole('EMPLOYER'), JobController.createJob);
router.put('/:id', requireAuth, requireRole('EMPLOYER'), JobController.updateJob);
router.patch('/:id/status', requireAuth, requireRole('EMPLOYER'), JobController.toggleStatus);
router.delete('/:id', requireAuth, requireRole('EMPLOYER'), JobController.deleteJob);

export default router;
