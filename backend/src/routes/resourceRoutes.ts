import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', ResourceController.getResources);
router.get('/:slug', ResourceController.getResourceBySlug);
router.post('/', requireAuth, requireRole('ADMIN'), ResourceController.createResource);
router.delete('/:id', requireAuth, requireRole('ADMIN'), ResourceController.deleteResource);

export default router;
