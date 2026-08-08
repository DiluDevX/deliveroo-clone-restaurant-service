import { Router } from 'express';
import {
  listRestaurants,
  getRestaurant,
  getRestaurantByOrgId,
  getRestaurantByProvisioningId,
  completeRestaurantProvisioning,
  deleteProvisionedRestaurant,
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
  restaurantOrgIdParamsSchema,
  restaurantProvisioningIdParamsSchema,
} from '../../schema/restaurant.schema';

const router = Router();

router.get('/', validateQuery(listRestaurantsQuerySchema), listRestaurants);

router.get('/by-org-id/:orgId', validateParams(restaurantOrgIdParamsSchema), getRestaurantByOrgId);

router.get(
  '/provisioning/:provisioningId',
  validateParams(restaurantProvisioningIdParamsSchema),
  getRestaurantByProvisioningId
);

router.patch(
  '/provisioning/:provisioningId/complete',
  validateParams(restaurantProvisioningIdParamsSchema),
  completeRestaurantProvisioning
);

router.delete(
  '/provisioning/:provisioningId',
  validateParams(restaurantProvisioningIdParamsSchema),
  deleteProvisionedRestaurant
);

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
