import { Prisma, Restaurant, RestaurantStatus } from '@prisma/client';
import { prisma, isPrismaErrorWithCode } from '../config/database';
import { RestaurantNotFoundError, ConflictError, ForbiddenError } from '../utils/errors';
import { PRISMA_CODE } from '../utils/constants';
import { ActorContext } from '../types/express.d';

export async function assertRestaurantOwnership(
  restaurantId: string,
  actor: ActorContext
): Promise<void> {
  if (actor.type === 'ADMIN') {
    return;
  }

  if (actor.type === 'RESTAURANT') {
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, deletedAt: null },
      select: { id: true, orgId: true },
    });

    if (!restaurant) {
      throw new RestaurantNotFoundError(`Restaurant with id ${restaurantId} not found`);
    }

    if (!actor.actorId || (restaurant.id !== actor.actorId && restaurant.orgId !== actor.actorId)) {
      throw new ForbiddenError('You do not have permission to access this restaurant');
    }

    return;
  }

  throw new ForbiddenError('You do not have permission to perform this action');
}

export async function findMany(
  actor: ActorContext | undefined,
  filters: {
    cuisine?: string;
    search?: string;
    status?: 'ACTIVE' | 'DISABLED';
    tags?: string;
    rating?: number;
    minDeliveryFee?: number;
    maxDeliveryFee?: number;
    minOrderValue?: number;
    maxOrderValue?: number;
    isOpen?: boolean;
  },
  pagination: { skip?: number; take?: number },
  orderBy?: Prisma.RestaurantOrderByWithRelationInput
): Promise<{ data: Restaurant[]; total: number }> {
  const isAdmin = actor?.type === 'ADMIN';

  // Get current time for isOpen filter
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM" format
  const hasNumber = (value?: number): value is number =>
    value !== undefined && !Number.isNaN(value);
  const deliveryChargeFilter = {
    ...(hasNumber(filters.minDeliveryFee) ? { gte: filters.minDeliveryFee } : {}),
    ...(hasNumber(filters.maxDeliveryFee) ? { lte: filters.maxDeliveryFee } : {}),
  };
  const minimumValueFilter = {
    ...(hasNumber(filters.minOrderValue) ? { gte: filters.minOrderValue } : {}),
    ...(hasNumber(filters.maxOrderValue) ? { lte: filters.maxOrderValue } : {}),
  };

  const where: Prisma.RestaurantWhereInput = {
    ...(isAdmin && filters.status
      ? { status: filters.status }
      : !isAdmin
        ? { status: RestaurantStatus.ACTIVE }
        : {}),
    ...(filters.cuisine ? { cuisine: filters.cuisine } : {}),
    ...(hasNumber(filters.rating) ? { rating: { gte: filters.rating } } : {}),
    ...(Object.keys(deliveryChargeFilter).length > 0
      ? { deliveryCharge: deliveryChargeFilter }
      : {}),
    ...(Object.keys(minimumValueFilter).length > 0 ? { minimumValue: minimumValueFilter } : {}),
    ...(filters.tags ? { tags: { hasSome: filters.tags.split(',') } } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { cuisine: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
    // isOpen filter - check if current time is between openingAt and closingAt
    ...(filters.isOpen
      ? {
          openingAt: { lte: currentTime },
          closingAt: { gte: currentTime },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
    }),
    prisma.restaurant.count({ where }),
  ]);

  return { data, total };
}

export async function count(
  actor: ActorContext | undefined,
  filters: { cuisine?: string }
): Promise<number> {
  const isAdmin = actor?.type === 'ADMIN';

  const where: Prisma.RestaurantWhereInput = {
    ...(isAdmin ? {} : { status: RestaurantStatus.ACTIVE }),
    ...(filters.cuisine ? { cuisine: filters.cuisine } : {}),
  };

  return prisma.restaurant.count({ where });
}

export async function findOneById(
  id: string,
  actor: ActorContext | undefined
): Promise<
  | (Restaurant & {
      categories: {
        id: string;
        name: string;
        sortOrder: number;
        dishes: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image: string | null;
          isVegetarian: boolean;
          isSpicy: boolean;
          isAvailable: boolean;
          isPopular: boolean | null;
          discountPercent: number | null;
          tags: string[];
          sortOrder: number;
        }[];
      }[];
    })
  | null
> {
  const isAdmin = actor?.type === 'ADMIN';

  return prisma.restaurant.findFirst({
    where: { id },
    include: {
      categories: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          sortOrder: true,
          dishes: {
            where: { deletedAt: null, ...(isAdmin ? {} : { isAvailable: true }) },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              image: true,
              isVegetarian: true,
              isSpicy: true,
              isAvailable: true,
              isPopular: true,
              discountPercent: true,
              tags: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });
}

export async function create(data: Prisma.RestaurantCreateInput): Promise<Restaurant> {
  try {
    return await prisma.restaurant.create({ data });
  } catch (error) {
    if (isPrismaErrorWithCode(error, PRISMA_CODE.CONFLICT)) {
      throw new ConflictError('A restaurant with this orgId already exists');
    }
    throw error;
  }
}

export async function update(id: string, data: Prisma.RestaurantUpdateInput): Promise<Restaurant> {
  try {
    return await prisma.restaurant.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, PRISMA_CODE.NOT_FOUND)) {
      throw new RestaurantNotFoundError(`Restaurant with id ${id} not found`);
    }
    throw error;
  }
}

export async function softDelete(id: string): Promise<Restaurant> {
  try {
    return await prisma.restaurant.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, PRISMA_CODE.NOT_FOUND)) {
      throw new RestaurantNotFoundError(`Restaurant with id ${id} not found`);
    }
    throw error;
  }
}
