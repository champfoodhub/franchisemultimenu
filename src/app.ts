import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import menuRoutes from './routes/menu.routes.ts';
import authRoutes from './routes/auth.routes.ts';
import hqRoutes from './routes/hq.routes.ts';
import branchRoutes from './routes/branch.routes.ts';

const app: Application = express(); // MUST be initialized before middleware

// Middleware
app.use(express.json());

// Routes
app.use('/api/menu', menuRoutes);
app.use('/auth', authRoutes);
app.use('/hq', hqRoutes);
app.use('/branch', branchRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'FoodHub Backend',
  });
});

export default app;
