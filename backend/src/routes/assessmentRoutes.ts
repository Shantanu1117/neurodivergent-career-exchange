import { Router } from 'express';
import { AssessmentController } from '../controllers/assessmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/questions', AssessmentController.getQuestions);
router.post('/submit', requireAuth, requireRole('CANDIDATE'), AssessmentController.submitAssessment);
router.get('/my-results', requireAuth, requireRole('CANDIDATE'), AssessmentController.getMyResults);

export default router;
