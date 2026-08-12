import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './middlewares/logger';
import userRoutes from './routes/userRoutes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    message: 'User Management API is up and running'
  });
});

// API Routes (v1)
app.use('/api/v1/users', userRoutes);

// 404 Not Found Handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler Fallback
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Error] ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
