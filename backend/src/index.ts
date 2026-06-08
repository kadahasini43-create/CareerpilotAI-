import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database (Mongo with local JSON fallback)
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CareerPilot AI Backend'
  });
});

// Mount Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler caught:", err);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected server error occurred."
  });
});

// Boot Server
app.listen(PORT, () => {
  console.log(`🚀 CareerPilot AI Backend running on port http://localhost:${PORT}`);
  console.log(`🩺 Health check URL: http://localhost:${PORT}/health`);
});
