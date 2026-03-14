import { Prisma, Category } from '@prisma/client';
import { prisma } from '../config/database';
import { CategoryNotFoundError } from '../utils/errors';

export async function findManyByRestaurant(restaurantId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { restaurantId, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function findOneById(id: string, restaurantId: string): Promise<Category | null> {
  return prisma.category.findFirst({
    where: { id, restaurantId, deletedAt: null },
  });
}

export async function create(
  restaurantId: string,
  data: Omit<Prisma.CategoryCreateInput, 'restaurant'>
): Promise<Category> {
  return prisma.category.create({
    data: {
      ...data,
      restaurant: { connect: { id: restaurantId } },
    },
  });
}

export async function update(
  id: string,
  restaurantId: string,
  data: Prisma.CategoryUpdateInput
): Promise<Category> {
  const category = await prisma.category.findFirst({
    where: { id, restaurantId, deletedAt: null },
  });

  if (!category) {
    throw new CategoryNotFoundError(
      `Category with id ${id} not found in restaurant ${restaurantId}`
    );
  }

  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function softDelete(id: string, restaurantId: string): Promise<Category> {
  const category = await prisma.category.findFirst({
    where: { id, restaurantId, deletedAt: null },
  });

  if (!category) {
    throw new CategoryNotFoundError(
      `Category with id ${id} not found in restaurant ${restaurantId}`
    );
  }

  return prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
