import { z } from 'zod';

export const createDishSchema = z.object({
  categoryId: z.string().min(1, 'categoryId is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long').trim(),
  description: z.string().max(1000, 'Description is too long').trim().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  image: z.string().url('Image must be a valid URL').optional(),
  isVegetarian: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  tags: z.array(z.enum(['BESTSELLER', 'NEW', 'SPECIAL'])).default([]),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateDishSchema = z
  .object({
    categoryId: z.string().min(1, 'categoryId is required').optional(),
    name: z.string().min(1, 'Name is required').max(200, 'Name is too long').trim().optional(),
    description: z.string().max(1000, 'Description is too long').trim().optional(),
    price: z.number().min(0, 'Price must be non-negative').optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    isVegetarian: z.boolean().optional(),
    isSpicy: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    tags: z.array(z.enum(['BESTSELLER', 'NEW', 'SPECIAL'])).optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const listDishesQuerySchema = z.object({
  categoryId: z.string().optional(),
  isVegetarian: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  isAvailable: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export const dishIdParamsSchema = z.object({
  restaurantId: z.string().min(1, 'restaurantId is required'),
  dishId: z.string().min(1, 'dishId is required'),
});
