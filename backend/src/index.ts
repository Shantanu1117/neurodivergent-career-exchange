import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Job } from './models/Job.js';
import { seedDatabase } from './utils/seed.js';
import { AdminController } from './controllers/adminController.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

dotenv.config();

const app = express();
let PORT = Number(process.env.PORT) || 5001;

// macOS AirPlay Receiver occupies port 5000 by default. Protect against accidental port 5000:
if (PORT === 5000) {
  console.log('[Port Config] Port 5000 is reserved by macOS AirPlay. Auto-switching to port 5001.');
  PORT = 5001;
}

// Multi-Origin CORS Support (Localhost + Configured Frontend + Vercel Deployments)
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = origin.replace(/\/$/, '');
      if (
        configuredOrigins.includes(normalized) ||
        normalized.startsWith('http://localhost:') ||
        normalized.startsWith('http://127.0.0.1:') ||
        normalized.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check Handler (accessible at /, /health, /api/health, and /api/v1/health)
const healthHandler = (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Neurodivergent Career Exchange API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
};

app.get('/', healthHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Unified API Router mounted at /api/v1, /api, and root fallback to prevent 404s across any VITE_API_URL format
const apiRouter = Router();
apiRouter.get('/health', healthHandler);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/candidates', candidateRoutes);
apiRouter.use('/assessments', assessmentRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/interviews', interviewRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/employers', employerRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/emails', emailRoutes);
apiRouter.post('/feedback/accessibility', AdminController.createAccessibilityReport);

app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Centralized Error Handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// Startup & Auto-Seed Function
const startServer = async () => {
  await connectDB();

  // Check if initial seeding is needed
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      console.log('[Startup] Detected fresh database. Auto-populating initial enterprise demo dataset...');
      await seedDatabase();
    } else {
      console.log(`[Startup] Database ready with ${jobCount} active job postings.`);
    }
  } catch (seedErr) {
    console.error('[Startup] Seed verification error:', seedErr);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] Neurodivergent Career Exchange API listening on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = PORT + 1;
      console.warn(`[Port Conflict] Port ${PORT} is busy. Retrying automatically on port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`[Server] Neurodivergent Career Exchange API listening on fallback port ${fallbackPort}`);
        console.log(`[Server] Health check: http://localhost:${fallbackPort}/api/health`);
      });
    } else {
      console.error('[Server Error]:', err);
    }
  });
};

startServer().catch((err) => {
  console.error('[Fatal Error] Failed to boot server:', err);
  process.exit(1);
});

export default app;
