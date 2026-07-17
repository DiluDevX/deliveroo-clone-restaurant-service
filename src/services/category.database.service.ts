import { Prisma, Category } from '@prisma/client';
import { prisma } from '../config/database';
import { CategoryNotFoundError } from '../utils/errors';

const activeCategoryWhere: Prisma.CategoryWhereInput = {
  OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
};

export async function findManyByRestaurant(restaurantId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { ...activeCategoryWhere, restaurantId },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function findOneById(id: string, restaurantId?: string): Promise<Category | null> {
  return prisma.category.findFirst({
    where: { ...activeCategoryWhere, id, ...(restaurantId ? { restaurantId } : {}) },
  });
}

export async function create(
  restaurantId: string,
  data: Omit<Prisma.CategoryCreateInput, 'restaurant'>
): Promise<Category> {
  return prisma.category.create({
    data: {
      ...data,
      deletedAt: null,
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
    where: { ...activeCategoryWhere, id, restaurantId },
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
    where: { ...activeCategoryWhere, id, restaurantId },
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
