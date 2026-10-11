import { Router } from 'express';
import { EmailController } from '../controllers/emailController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/my-emails', requireAuth, EmailController.getMyEmails);
router.post('/send-test', requireAuth, EmailController.sendTestDigestEmail);
router.post('/send-interview-packet', requireAuth, EmailController.sendInterviewPacket);
router.post('/send-passport', requireAuth, EmailController.sendPassportEmail);
router.post('/send-custom', requireAuth, EmailController.sendCustomEmail);

export default router;
