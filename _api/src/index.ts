import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import express, { type Express, type Request, type Response } from 'express';

import { requireAuth } from './middleware/auth';
import todoRoutes from './routes/todoRoutes';
import userRoutes from './routes/userRoutes';
import webhookRoutes from './routes/webhookRoutes2';

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/todos', requireAuth, todoRoutes);
app.use('/api/webhooks/clerk', webhookRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
