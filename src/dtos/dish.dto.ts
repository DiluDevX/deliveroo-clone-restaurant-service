import { z } from 'zod';
import {
  createDishSchema,
  updateDishSchema,
  listDishesQuerySchema,
  dishIdParamsSchema,
} from '../schema/dish.schema';

export type CreateDishDTO = z.infer<typeof createDishSchema>;
export type UpdateDishDTO = z.infer<typeof updateDishSchema>;
export type ListDishesQueryDTO = z.infer<typeof listDishesQuerySchema>;
export type DishIdParamsDTO = z.infer<typeof dishIdParamsSchema>;

export interface DishResponseDTO {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isVegetarian: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  tags: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
