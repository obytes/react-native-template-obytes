import { PrismaClient } from '@prisma/client';
import { type Request, type Response, Router } from 'express';

import { requireOwnership } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all todos (only for the authenticated user)
router.get('/', async (req: Request, res: Response) => {
  try {
    const todos = await prisma.todoItem.findMany({
      where: {
        userId: req.auth.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

// Get todo by ID (with ownership check)
router.get('/:id', requireOwnership, async (req: Request, res: Response) => {
  try {
    const todo = await prisma.todoItem.findUnique({
      where: {
        id: req.params.id,
        userId: req.auth.userId, // Ensure the todo belongs to the user
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching todo' });
  }
});

// Get todos by user ID
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const todos = await prisma.todoItem.findMany({
      where: { userId: Number(req.params.userId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user todos' });
  }
});

// Create todo (automatically assign to authenticated user)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, dueDate } = req.body;
    const todo = await prisma.todoItem.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.auth.userId, // Use the authenticated user's ID
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Error creating todo' });
  }
});

// Update todo (with ownership check)
router.put('/:id', requireOwnership, async (req: Request, res: Response) => {
  try {
    const { title, description, completed, dueDate } = req.body;
    const todo = await prisma.todoItem.update({
      where: {
        id: req.params.id,
        userId: req.auth.userId, // Ensure the todo belongs to the user
      },
      data: {
        title,
        description,
        completed,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Error updating todo' });
  }
});

// Delete todo (with ownership check)
router.delete('/:id', requireOwnership, async (req: Request, res: Response) => {
  try {
    await prisma.todoItem.delete({
      where: {
        id: req.params.id,
        userId: req.auth.userId, // Ensure the todo belongs to the user
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting todo' });
  }
});

export default router;
