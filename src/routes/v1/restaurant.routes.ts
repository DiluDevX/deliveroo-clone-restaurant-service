import { Router } from 'express';
import {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../../controllers/v1/restaurant.controller';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  listRestaurantsQuerySchema,
  restaurantIdParamsSchema,
} from '../../schema/restaurant.schema';

const router = Router();

router.get('/', validateQuery(listRestaurantsQuerySchema), listRestaurants);

router.get('/:restaurantId', validateParams(restaurantIdParamsSchema), getRestaurant);

router.post('/', validateBody(createRestaurantSchema), createRestaurant);

router.patch(
  '/:restaurantId',
  validateParams(restaurantIdParamsSchema),
  validateBody(updateRestaurantSchema),
  updateRestaurant
);

router.delete('/:restaurantId', validateParams(restaurantIdParamsSchema), deleteRestaurant);

export default router;
