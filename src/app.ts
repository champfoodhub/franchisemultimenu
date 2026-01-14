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

// Import MySQL config for initialization
import mysqlConfig from './config/mysql';

const app: Application = express();

// Middleware
app.use(express.json());

// Initialize database connection
mysqlConfig.testConnection().catch((err) => {
  console.error('Failed to connect to MySQL:', err);
  process.exit(1);
});

// Routes
app.use('/auth', authRoutes);
app.use('/hq', hqRoutes);
app.use('/branch', branchRoutes);
app.use('/menu', menuRoutes);
app.use('/schedules', scheduleRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'Franchise Menu Management',
    database: 'MySQL',
  });
});

export default app;

