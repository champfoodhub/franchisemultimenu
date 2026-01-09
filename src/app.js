import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import menuRoutes from './routes/menu.routes.js';
import authRoutes from './routes/auth.routes.js';
import hqRoutes from './routes/hq.routes.js';
import branchRoutes from './routes/branch.routes.js';

const app = express(); // <-- MUST come first

// Middleware to parse JSON
app.use(express.json());

// Route registration
app.use('/api/menu', menuRoutes);
app.use('/auth', authRoutes);
app.use('/hq', hqRoutes);
app.use('/branch', branchRoutes);

// Optional: Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'FoodHub Backend' });
});

export default app;
