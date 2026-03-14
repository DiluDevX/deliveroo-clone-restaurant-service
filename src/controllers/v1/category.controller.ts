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
} from '../../dtos/category.dto';
import { ForbiddenError, RestaurantNotFoundError } from '../../utils/errors';
import { RestaurantIdParamsDTO } from '../../dtos/restaurant.dto';

export const listCategories = async (
  req: Request<RestaurantIdParamsDTO>,
  res: Response<CommonResponseDTO<CategoryResponseDTO[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    const categories = await categoryService.findManyByRestaurant(restaurantId);

    logger.info({ restaurantId, count: categories.length }, 'categories listed');

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
  req: Request<RestaurantIdParamsDTO, CommonResponseDTO<CategoryResponseDTO>, CreateCategoryDTO>,
  res: Response<CommonResponseDTO<CategoryResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
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
    const { restaurantId, categoryId } = req.params;
    const actor = req.actor;

    if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
      throw new ForbiddenError('Only ADMIN or RESTAURANT actors can update categories');
    }

    await restaurantService.assertRestaurantOwnership(restaurantId, actor);

    const category = await categoryService.update(categoryId, restaurantId, req.body);

    logger.info({ id: categoryId, restaurantId }, 'category updated');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
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
    const { restaurantId, categoryId } = req.params;
    const actor = req.actor;

    if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
      throw new ForbiddenError('Only ADMIN or RESTAURANT actors can delete categories');
    }

    await restaurantService.assertRestaurantOwnership(restaurantId, actor);

    await categoryService.softDelete(categoryId, restaurantId);

    logger.info({ id: categoryId, restaurantId }, 'category deleted');

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
