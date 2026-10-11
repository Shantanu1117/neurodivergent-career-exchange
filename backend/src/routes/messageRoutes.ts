import { Router } from 'express';
import { MessageController } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/conversations', requireAuth, MessageController.getConversations);
router.get('/contacts', requireAuth, MessageController.getContacts);
router.get('/conversations/:conversationId', requireAuth, MessageController.getMessages);
router.post('/send', requireAuth, MessageController.sendMessage);

export default router;
