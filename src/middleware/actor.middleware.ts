import { Request, Response, NextFunction } from 'express';
import { ActorContext, RestaurantActorRole } from '../types/express.d';

const ACTOR_TYPE_HEADER = 'x-actor-type';
const ACTOR_USER_ID_HEADER = 'x-actor-user-id';
const ACTOR_ACTOR_ID_HEADER = 'x-actor-id';
const ACTOR_RESTAURANT_ROLE_HEADER = 'x-actor-restaurant-role';
const VALID_RESTAURANT_ROLES: RestaurantActorRole[] = [
  'employee',
  'super_admin',
  'admin',
  'finance',
];

export function actorMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const rawType = req.headers[ACTOR_TYPE_HEADER];

  if (!rawType || typeof rawType !== 'string') {
    return next();
  }

  const validTypes: ActorContext['type'][] = ['USER', 'RESTAURANT', 'DRIVER', 'SYSTEM', 'ADMIN'];
  const type = rawType.toUpperCase() as ActorContext['type'];

  if (!validTypes.includes(type)) {
    return next();
  }

  const userId = req.headers[ACTOR_USER_ID_HEADER];
  const actorId = req.headers[ACTOR_ACTOR_ID_HEADER];
  const restaurantRole = req.headers[ACTOR_RESTAURANT_ROLE_HEADER];

  req.actor = {
    type,
    userId: typeof userId === 'string' ? userId : undefined,
    actorId: typeof actorId === 'string' ? actorId : undefined,
    restaurantRole:
      typeof restaurantRole === 'string' &&
      VALID_RESTAURANT_ROLES.includes(restaurantRole as RestaurantActorRole)
        ? (restaurantRole as RestaurantActorRole)
        : undefined,
  };

  next();
}
