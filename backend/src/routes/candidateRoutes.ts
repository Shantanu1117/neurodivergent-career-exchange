import { Router } from 'express';
import { CandidateController } from '../controllers/candidateController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/profile', requireAuth, requireRole('CANDIDATE'), CandidateController.getProfile);
router.put('/profile', requireAuth, requireRole('CANDIDATE'), CandidateController.updateProfile);
router.post('/parse-cv', requireAuth, requireRole('CANDIDATE'), CandidateController.parseCvText);
router.get('/skill-gap/:jobId', requireAuth, requireRole('CANDIDATE'), CandidateController.getSkillGapAnalysis);
router.get('/export-data', requireAuth, requireRole('CANDIDATE'), CandidateController.exportCandidateData);
router.delete('/account', requireAuth, requireRole('CANDIDATE'), CandidateController.deleteCandidateAccount);
router.get('/placed', CandidateController.getPlacedCandidates);
router.get('/search', requireAuth, CandidateController.searchCandidates);
router.get('/:id', CandidateController.getCandidateById);

export default router;
