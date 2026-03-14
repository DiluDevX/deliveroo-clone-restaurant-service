import { z } from 'zod';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamsSchema,
} from '../schema/category.schema';

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type CategoryIdParamsDTO = z.infer<typeof categoryIdParamsSchema>;

export interface CategoryResponseDTO {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
