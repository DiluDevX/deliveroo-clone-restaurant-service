import { Router } from 'express';
import {
  listDishes,
  getDish,
  createDish,
  updateDish,
  deleteDish,
} from '../../controllers/v1/dish.controller';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  createDishSchema,
  updateDishSchema,
  listDishesQuerySchema,
  dishIdParamsSchema,
} from '../../schema/dish.schema';
import { restaurantIdParamsSchema } from '../../schema/restaurant.schema';

const router = Router({ mergeParams: true });

router.get(
  '/',
  validateParams(restaurantIdParamsSchema),
  validateQuery(listDishesQuerySchema),
  listDishes
);

router.get('/:dishId', validateParams(dishIdParamsSchema), getDish);

router.post(
  '/',
  validateParams(restaurantIdParamsSchema),
  validateBody(createDishSchema),
  createDish
);

router.patch(
  '/:dishId',
  validateParams(dishIdParamsSchema),
  validateBody(updateDishSchema),
  updateDish
);

router.delete('/:dishId', validateParams(dishIdParamsSchema), deleteDish);

export default router;
