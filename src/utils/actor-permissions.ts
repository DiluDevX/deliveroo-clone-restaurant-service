import { ActorContext, RestaurantActorRole } from '../types/express.d';
import { ForbiddenError } from './errors';

const MENU_MANAGER_ROLES: RestaurantActorRole[] = ['super_admin', 'admin'];

export function assertCanManageMenu(
  actor: ActorContext | undefined
): asserts actor is ActorContext {
  if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
    throw new ForbiddenError('Only ADMIN or RESTAURANT actors can manage menu items');
  }

  if (actor.type === 'ADMIN') {
    return;
  }

  if (!actor.restaurantRole || !MENU_MANAGER_ROLES.includes(actor.restaurantRole)) {
    throw new ForbiddenError('Only restaurant admins can manage menu items');
  }
}
