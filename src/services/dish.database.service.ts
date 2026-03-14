import { Prisma, Dish } from '@prisma/client';
import { prisma } from '../config/database';
import { DishNotFoundError } from '../utils/errors';

export async function findManyByRestaurant(
  restaurantId: string,
  filters: { categoryId?: string; isVegetarian?: boolean; isAvailable?: boolean }
): Promise<Dish[]> {
  const where: Prisma.DishWhereInput = {
    deletedAt: null,
    ...(restaurantId ? { restaurantId } : {}),
    ...(filters.categoryId !== undefined ? { categoryId: filters.categoryId } : {}),
    ...(filters.isVegetarian !== undefined ? { isVegetarian: filters.isVegetarian } : {}),
    ...(filters.isAvailable !== undefined ? { isAvailable: filters.isAvailable } : {}),
  };

  return prisma.dish.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
}

export async function findOneById(id: string, restaurantId?: string): Promise<Dish | null> {
  return prisma.dish.findFirst({
    where: {
      id,
      ...(restaurantId ? { restaurantId } : {}),
      deletedAt: null,
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
    where: { id, restaurantId, deletedAt: null },
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
    where: { id, restaurantId, deletedAt: null },
  });

  if (!dish) {
    throw new DishNotFoundError(`Dish with id ${id} not found in restaurant ${restaurantId}`);
  }

  return prisma.dish.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
