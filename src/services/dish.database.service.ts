import { Prisma, Dish } from '@prisma/client';
import { prisma } from '../config/database';
import { DishNotFoundError } from '../utils/errors';

const activeDishWhere: Prisma.DishWhereInput = {
  OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
};

export async function findManyByRestaurant(
  restaurantId: string,
  filters: {
    categoryId?: string;
    isVegetarian?: boolean;
    isAvailable?: boolean;
    isPopular?: boolean;
  }
): Promise<Dish[]> {
  const where: Prisma.DishWhereInput = {
    ...activeDishWhere,
    ...(restaurantId ? { restaurantId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.isVegetarian !== undefined ? { isVegetarian: filters.isVegetarian } : {}),
    ...(filters.isAvailable !== undefined ? { isAvailable: filters.isAvailable } : {}),
    ...(filters.isPopular !== undefined ? { isPopular: filters.isPopular } : {}),
  };

  return prisma.dish.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
}

export async function findOneById(id: string, restaurantId?: string): Promise<Dish | null> {
  return prisma.dish.findFirst({
    where: {
      ...activeDishWhere,
      id,
      ...(restaurantId ? { restaurantId } : {}),
    },
  });
}

export async function create(
  restaurantId: string,
  data: Omit<Prisma.DishCreateInput, 'restaurant' | 'category'> & { categoryId: string }
): Promise<Dish> {
  const { categoryId, ...rest } = data;
  return prisma.dish.create({
    data: {
      ...rest,
      deletedAt: null,
      restaurant: { connect: { id: restaurantId } },
      category: { connect: { id: categoryId } },
    },
  });
}

export async function update(
  id: string,
  restaurantId: string,
  data: Prisma.DishUpdateInput
): Promise<Dish> {
  const dish = await prisma.dish.findFirst({
    where: { ...activeDishWhere, id, restaurantId },
  });

  if (!dish) {
    throw new DishNotFoundError(`Dish with id ${id} not found in restaurant ${restaurantId}`);
  }

  return prisma.dish.update({
    where: { id },
    data,
  });
}

export async function softDelete(id: string, restaurantId: string): Promise<Dish> {
  const dish = await prisma.dish.findFirst({
    where: { ...activeDishWhere, id, restaurantId },
  });

  if (!dish) {
    throw new DishNotFoundError(`Dish with id ${id} not found in restaurant ${restaurantId}`);
  }

  return prisma.dish.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
