import { Router } from 'express';
import restaurantRoutes from './v1/restaurant.routes';
import categoryRoutes from './v1/category.routes';
import dishRoutes from './v1/dish.routes';
import commonRoutes from './common.routes';
import { apiKeyMiddleware } from '../middleware/api-key.middleware';
import { actorMiddleware } from '../middleware/actor.middleware';
import { environment } from '../config/environment';

const router = Router();

const authMiddleware = [apiKeyMiddleware([environment.apiKey]), actorMiddleware];

router.use('/api/v1/restaurants', ...authMiddleware, restaurantRoutes);
router.use('/api/v1/categories', ...authMiddleware, categoryRoutes);
router.use('/api/v1/dishes', ...authMiddleware, dishRoutes);

router.use(commonRoutes);

export default router;
