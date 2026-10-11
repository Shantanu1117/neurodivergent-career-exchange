import { Router } from 'express';
import { InterviewController } from '../controllers/interviewController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('EMPLOYER'), InterviewController.scheduleInterview);
router.post('/request-practice', requireAuth, InterviewController.requestPracticeInterview);
router.get('/my-interviews', requireAuth, InterviewController.getMyInterviews);
router.patch('/:id/status', requireAuth, InterviewController.updateStatus);

export default router;
