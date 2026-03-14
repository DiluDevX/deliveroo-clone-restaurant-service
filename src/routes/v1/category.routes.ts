import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/v1/category.controller';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamsSchema,
} from '../../schema/category.schema';
import { restaurantIdParamsSchema } from '../../schema/restaurant.schema';

const router = Router({ mergeParams: true });

router.get('/', validateParams(restaurantIdParamsSchema), listCategories);

router.post(
  '/',
  validateParams(restaurantIdParamsSchema),
  validateBody(createCategorySchema),
  createCategory
);

router.patch(
  '/:categoryId',
  validateParams(categoryIdParamsSchema),
  validateBody(updateCategorySchema),
  updateCategory
);

router.delete('/:categoryId', validateParams(categoryIdParamsSchema), deleteCategory);

export default router;
