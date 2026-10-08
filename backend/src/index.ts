import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Job } from './models/Job.js';
import { seedDatabase } from './utils/seed.js';

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

dotenv.config();

const app = express();
let PORT = Number(process.env.PORT) || 5001;

// macOS AirPlay Receiver occupies port 5000 by default. Protect against accidental port 5000:
if (PORT === 5000) {
  console.log('[Port Config] Port 5000 is reserved by macOS AirPlay. Auto-switching to port 5001.');
  PORT = 5001;
}

// Security & Parsing Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Neurodivergent Career Exchange API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/employers', employerRoutes);
app.use('/api/v1/admin', adminRoutes);

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
