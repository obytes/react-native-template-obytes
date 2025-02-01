import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all todos
router.get('/', async (req: Request, res: Response) => {
  try {
    const todos = await prisma.todoItem.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

// Get todo by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const todo = await prisma.todoItem.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
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
            email: true
          }
        }
      }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user todos' });
  }
});

// Create todo
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, dueDate, userId } = req.body;
    const todo = await prisma.todoItem.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: Number(userId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Error creating todo' });
  }
});

// Update todo
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, completed, dueDate } = req.body;
    const todo = await prisma.todoItem.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        description,
        completed,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Error updating todo' });
  }
});

// Delete todo
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.todoItem.delete({
      where: { id: Number(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting todo' });
  }
});

export default router; 