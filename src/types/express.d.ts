export type RestaurantActorRole = 'employee' | 'super_admin' | 'admin' | 'finance';

export interface ActorContext {
  type: 'USER' | 'RESTAURANT' | 'DRIVER' | 'SYSTEM' | 'ADMIN';
  userId?: string;
  actorId?: string;
  restaurantRole?: RestaurantActorRole;
}

declare global {
  namespace Express {
    interface Request {
      actor?: ActorContext;
    }
  }
}
