import { Router } from 'express';
import {
  getDish,
  createDish,
  updateDish,
  deleteDish,
  listDishes,
} from '../../controllers/v1/dish.controller';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  createDishSchema,
  updateDishSchema,
  listDishesQuerySchema,
  dishIdParamsSchema,
} from '../../schema/dish.schema';

const router = Router();

router.get('/', validateQuery(listDishesQuerySchema), listDishes);

router.get('/:dishId', validateParams(dishIdParamsSchema), getDish);

router.post('/', validateBody(createDishSchema), createDish);

router.patch(
  '/:dishId',
  validateParams(dishIdParamsSchema),
  validateBody(updateDishSchema),
  updateDish
);

router.delete('/:dishId', validateParams(dishIdParamsSchema), deleteDish);

export default router;
