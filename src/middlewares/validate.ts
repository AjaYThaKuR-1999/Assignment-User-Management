import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Zod Schema for User Creation Validation
export const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  address: z.object({
    city: z.string().trim(),
    zipcode: z.string().trim(),
    geo: z.object({
      lat: z.number(),
      lng: z.number()
    })
  })
});

// TypeScript User Interface derived from Zod Schema
export type IUser = z.infer<typeof createUserSchema>;

// Partial Schema for User Update Validation (All fields optional)
export const updateUserSchema = createUserSchema.partial();

// Zod Schema for User List Query Validation
export const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().trim().optional()
});

// Zod Schema for MongoDB ObjectId Param Validation
export const userIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID format');

// Middleware to validate User Creation payload
export const validateUserCreate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.body = createUserSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => e.message)
      });
      return;
    }
    next(error);
  }
};

// Middleware to validate User Update payload
export const validateUserUpdate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.body = updateUserSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => e.message)
      });
      return;
    }
    next(error);
  }
};

// Middleware to validate User List Query parameters
export const validateListQuery = (req: Request, res: Response, next: NextFunction): void => {
  const result = listQuerySchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid query parameters'
    });
    return;
  }
  next();
};

// Middleware to validate User ID parameter in URL
export const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
  const result = userIdSchema.safeParse(req.params.id);
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid User ID format'
    });
    return;
  }
  next();
};
