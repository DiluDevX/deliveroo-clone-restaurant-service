import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long').trim(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200, 'Name is too long').trim().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const categoryIdParamsSchema = z.object({
  restaurantId: z.string().min(1, 'restaurantId is required'),
  categoryId: z.string().min(1, 'categoryId is required'),
});
