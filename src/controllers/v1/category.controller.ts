import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as categoryService from '../../services/category.database.service';
import * as restaurantService from '../../services/restaurant.database.service';
import { logger } from '../../utils/logger';
import { CommonResponseDTO } from '../../dtos/common.dto';
import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryIdParamsDTO,
  CategoryResponseDTO,
  CategoryQueryDTO,
} from '../../dtos/category.dto';
import { ForbiddenError, RestaurantNotFoundError } from '../../utils/errors';

export const listCategories = async (
  req: Request,
  res: Response<CommonResponseDTO<CategoryResponseDTO[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurant } = req.query as CategoryQueryDTO;

    const categories = await categoryService.findManyByRestaurant(restaurant);

    logger.info({ restaurantId: restaurant, count: categories.length }, 'categories listed');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    logger.error(error, 'list categories error');
    next(error);
  }
};

export const createCategory = async (
  req: Request<unknown, CommonResponseDTO<CategoryResponseDTO>, CreateCategoryDTO>,
  res: Response<CommonResponseDTO<CategoryResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurant: restaurantId } = req.body;
    const actor = req.actor;

    if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
      throw new ForbiddenError('Only ADMIN or RESTAURANT actors can create categories');
    }

    await restaurantService.assertRestaurantOwnership(restaurantId, actor);

    const restaurant = await restaurantService.findOneById(restaurantId, actor);
    if (!restaurant) {
      throw new RestaurantNotFoundError(`Restaurant with id ${restaurantId} not found`);
    }

    const category = await categoryService.create(restaurantId, {
      name: req.body.name,
      sortOrder: req.body.sortOrder,
    });

    logger.info({ id: category.id, restaurantId }, 'category created');

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    logger.error(error, 'create category error');
    next(error);
  }
};

export const updateCategory = async (
  req: Request<CategoryIdParamsDTO, CommonResponseDTO<CategoryResponseDTO>, UpdateCategoryDTO>,
  res: Response<CommonResponseDTO<CategoryResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const actor = req.actor;

    if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
      throw new ForbiddenError('Only ADMIN or RESTAURANT actors can update categories');
    }

    const category = await categoryService.findOneById(categoryId, '');
    if (!category) {
      throw new RestaurantNotFoundError(`Category with id ${categoryId} not found`);
    }

    await restaurantService.assertRestaurantOwnership(category.restaurantId, actor);

    const updated = await categoryService.update(categoryId, category.restaurantId, req.body);

    logger.info({ id: categoryId }, 'category updated');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Category updated successfully',
      data: updated,
    });
  } catch (error) {
    logger.error(error, 'update category error');
    next(error);
  }
};

export const deleteCategory = async (
  req: Request<CategoryIdParamsDTO>,
  res: Response<CommonResponseDTO>,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const actor = req.actor;

    if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
      throw new ForbiddenError('Only ADMIN or RESTAURANT actors can delete categories');
    }

    const category = await categoryService.findOneById(categoryId, '');
    if (!category) {
      throw new RestaurantNotFoundError(`Category with id ${categoryId} not found`);
    }

    await restaurantService.assertRestaurantOwnership(category.restaurantId, actor);

    await categoryService.softDelete(categoryId, category.restaurantId);

    logger.info({ id: categoryId }, 'category deleted');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Category deleted successfully',
      data: null,
    });
  } catch (error) {
    logger.error(error, 'delete category error');
    next(error);
  }
};
