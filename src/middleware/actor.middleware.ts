import { Request, Response, NextFunction } from 'express';
import { ActorContext } from '../types/express.d';

const ACTOR_TYPE_HEADER = 'x-actor-type';
const ACTOR_USER_ID_HEADER = 'x-actor-user-id';
const ACTOR_ACTOR_ID_HEADER = 'x-actor-id';

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

  req.actor = {
    type,
    userId: typeof userId === 'string' ? userId : undefined,
    actorId: typeof actorId === 'string' ? actorId : undefined,
  };

  next();
}
