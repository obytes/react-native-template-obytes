import { clerkMiddleware } from '@clerk/express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import express, { type Express, type Request, type Response } from 'express';

import todoRoutes from './routes/todoRoutes';
import webhookRoutes from './routes/webhookRoutes2';

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/webhooks/clerk', webhookRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK 23454' });
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
