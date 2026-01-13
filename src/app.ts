import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import menuRoutes from './routes/menu.routes';
import authRoutes from './routes/auth.routes';
import hqRoutes from './routes/hq.routes';
import branchRoutes from './routes/branch.routes';
import scheduleRoutes from './routes/schedule.routes';

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/hq', hqRoutes);
app.use('/branch', branchRoutes);
app.use('/hq', scheduleRoutes); // Schedule management under HQ admin

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'FoodHub Backend',
  });
});

export default app;

