import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/v1/category.controller';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamsSchema,
  categoryQuerySchema,
} from '../../schema/category.schema';

const router = Router();

router.get('/', validateQuery(categoryQuerySchema), listCategories);

router.post('/', validateBody(createCategorySchema), createCategory);

router.patch(
  '/:categoryId',
  validateParams(categoryIdParamsSchema),
  validateBody(updateCategorySchema),
  updateCategory
);

router.delete('/:categoryId', validateParams(categoryIdParamsSchema), deleteCategory);

export default router;
