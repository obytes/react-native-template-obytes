import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { type NextFunction, type Request, type Response } from 'express';

// Extend Express Request type to include auth property
declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string;
      };
    }
  }
}

// Clerk authentication middleware
export const requireAuth = ClerkExpressRequireAuth({
  // Optional configuration
  onError: (err: any) => {
    console.error('Auth error bro:', err);
    // res.status(401).json({ error: 'Unauthorized' });
  },
});

// Middleware to ensure user can only access their own resources
export const requireOwnership = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedUserId = req.params.userId || req.params.id;

  if (requestedUserId && requestedUserId !== req.auth.userId) {
    return res
      .status(403)
      .json({ error: 'Forbidden: You can only access your own resources' });
  }

  next();
};
