export interface ActorContext {
  type: 'USER' | 'RESTAURANT' | 'DRIVER' | 'SYSTEM' | 'ADMIN';
  userId?: string;
  actorId?: string;
}

declare global {
  namespace Express {
    interface Request {
      actor?: ActorContext;
    }
  }
}
