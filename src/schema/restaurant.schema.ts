import { z } from 'zod';

export const createRestaurantSchema = z.object({
  orgId: z.string().min(1, 'orgId is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long').trim(),
  image: z.string().url('Image must be a valid URL'),
  description: z.string().max(1000, 'Description is too long').trim().optional(),
  tags: z.array(z.string().trim()).default([]),
  openingAt: z.string().min(1, 'Opening time is required'),
  closingAt: z.string().min(1, 'Closing time is required'),
  minimumValue: z.number().min(0, 'Minimum value must be non-negative'),
  deliveryCharge: z.number().min(0, 'Delivery charge must be non-negative'),
  commissionPercentage: z.number().min(0).max(100).default(15),
  cuisine: z.string().trim().optional(),
});

export const updateRestaurantSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200, 'Name is too long').trim().optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    description: z.string().max(1000, 'Description is too long').trim().optional(),
    tags: z.array(z.string().trim()).optional(),
    openingAt: z.string().optional(),
    closingAt: z.string().optional(),
    minimumValue: z.number().min(0, 'Minimum value must be non-negative').optional(),
    deliveryCharge: z.number().min(0, 'Delivery charge must be non-negative').optional(),
    commissionPercentage: z.number().min(0).max(100).optional(),
    cuisine: z.string().trim().optional(),
    status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const listRestaurantsQuerySchema = z.object({
  search: z.string().optional(),
  cuisine: z.string().optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  tags: z.string().optional(), // comma-separated tags

  // Rating filter
  rating: z.coerce.number().min(0).max(5).optional(),

  // Price filters
  minDeliveryFee: z.coerce.number().min(0).optional(),
  maxDeliveryFee: z.coerce.number().min(0).optional(),
  minOrderValue: z.coerce.number().min(0).optional(),

  // Open now filter
  isOpen: z.enum(['true', 'false']).optional(),

  // Pagination
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

export const restaurantIdParamsSchema = z.object({
  restaurantId: z.string().min(1, 'restaurantId is required'),
});
