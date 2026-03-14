import { z } from 'zod';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  listRestaurantsQuerySchema,
  restaurantIdParamsSchema,
} from '../schema/restaurant.schema';

export type CreateRestaurantDTO = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantDTO = z.infer<typeof updateRestaurantSchema>;
export type ListRestaurantsQueryDTO = z.infer<typeof listRestaurantsQuerySchema>;
export type RestaurantIdParamsDTO = z.infer<typeof restaurantIdParamsSchema>;

export interface RestaurantResponseDTO {
  id: string;
  orgId: string;
  name: string;
  image: string;
  description: string | null;
  tags: string[];
  openingAt: string;
  closingAt: string;
  minimumValue: number;
  deliveryCharge: number;
  commissionPercentage?: number;
  cuisine: string | null;
  rating: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
