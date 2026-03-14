import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as dishService from '../../services/dish.database.service';
import * as categoryService from '../../services/category.database.service';
import * as restaurantService from '../../services/restaurant.database.service';
import { logger } from '../../utils/logger';
import { CommonResponseDTO } from '../../dtos/common.dto';
import {
  CreateDishDTO,
  UpdateDishDTO,
  ListDishesQueryDTO,
  DishIdParamsDTO,
  DishResponseDTO,
} from '../../dtos/dish.dto';
import { ForbiddenError, DishNotFoundError, RestaurantNotFoundError } from '../../utils/errors';
import { DishTag } from '@prisma/client';

export const listDishes = async (
  req: Request,
  res: Response<CommonResponseDTO<DishResponseDTO[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, restaurant, isVegetarian, isAvailable } = req.query as ListDishesQueryDTO;

    let restaurantId = restaurant;
    if (restaurantId && category) {
      const cat = await categoryService.findOneById(category, restaurantId);
      if (cat) {
        restaurantId = cat.restaurantId;
      }
    } else {
      throw new ForbiddenError('Restaurant ID is required when filtering by category');
    }

    const dishes = await dishService.findManyByRestaurant(restaurantId, {
      categoryId: category,
      isVegetarian,
      isAvailable,
    });

    logger.info({ restaurantId, category, count: dishes.length }, 'dishes listed');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Dishes retrieved successfully',
      data: dishes as DishResponseDTO[],
    });
  } catch (error) {
    logger.error(error, 'list dishes error');
    next(error);
  }
};

export const getDish = async (
  req: Request<DishIdParamsDTO>,
  res: Response<CommonResponseDTO<DishResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { dishId } = req.params;

    const dish = await dishService.findOneById(dishId);

    if (!dish) {
      throw new DishNotFoundError(`Dish with id ${dishId} not found`);
    }

    logger.info({ id: dishId }, 'dish fetched');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Dish retrieved successfully',
      data: dish as DishResponseDTO,
    });
  } catch (error) {
    logger.error(error, 'get dish error');
    next(error);
  }
};

export const createDish = async (
  req: Request<unknown, CommonResponseDTO<DishResponseDTO>, CreateDishDTO>,
  res: Response<CommonResponseDTO<DishResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId } = req.body;
    const actor = req.actor;

    if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
      throw new ForbiddenError('Only ADMIN or RESTAURANT actors can create dishes');
    }

    const category = await categoryService.findOneById(categoryId, '');
    if (!category) {
      throw new RestaurantNotFoundError(`Category with id ${categoryId} not found`);
    }

    const restaurantId = category.restaurantId;

    await restaurantService.assertRestaurantOwnership(restaurantId, actor);

    const restaurant = await restaurantService.findOneById(restaurantId, actor);
    if (!restaurant) {
      throw new RestaurantNotFoundError(`Restaurant with id ${restaurantId} not found`);
    }

    const dish = await dishService.create(restaurantId, {
      categoryId: req.body.categoryId,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      isVegetarian: req.body.isVegetarian,
      isSpicy: req.body.isSpicy,
      isAvailable: req.body.isAvailable,
      tags: req.body.tags as DishTag[],
      sortOrder: req.body.sortOrder,
    });

    logger.info({ id: dish.id, restaurantId }, 'dish created');

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Dish created successfully',
      data: dish as DishResponseDTO,
    });
  } catch (error) {
    logger.error(error, 'create dish error');
    next(error);
  }
};

export const updateDish = async (
  req: Request<DishIdParamsDTO, CommonResponseDTO<DishResponseDTO>, UpdateDishDTO>,
  res: Response<CommonResponseDTO<DishResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { dishId } = req.params;
    const actor = req.actor;

    if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
      throw new ForbiddenError('Only ADMIN or RESTAURANT actors can update dishes');
    }

    const dish = await dishService.findOneById(dishId);
    if (!dish) {
      throw new DishNotFoundError(`Dish with id ${dishId} not found`);
    }

    await restaurantService.assertRestaurantOwnership(dish.restaurantId, actor);

    const updateData: {
      categoryId?: string;
      name?: string;
      description?: string;
      price?: number;
      image?: string;
      isVegetarian?: boolean;
      isSpicy?: boolean;
      isAvailable?: boolean;
      tags?: DishTag[];
      sortOrder?: number;
    } = {};

    if (req.body.categoryId !== undefined) updateData.categoryId = req.body.categoryId;
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.image !== undefined) updateData.image = req.body.image;
    if (req.body.isVegetarian !== undefined) updateData.isVegetarian = req.body.isVegetarian;
    if (req.body.isSpicy !== undefined) updateData.isSpicy = req.body.isSpicy;
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags as DishTag[];
    if (req.body.sortOrder !== undefined) updateData.sortOrder = req.body.sortOrder;

    const updated = await dishService.update(dishId, dish.restaurantId, updateData);

    logger.info({ id: dishId }, 'dish updated');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Dish updated successfully',
      data: updated as DishResponseDTO,
    });
  } catch (error) {
    logger.error(error, 'update dish error');
    next(error);
  }
};

export const deleteDish = async (
  req: Request<DishIdParamsDTO>,
  res: Response<CommonResponseDTO>,
  next: NextFunction
): Promise<void> => {
  try {
    const { dishId } = req.params;
    const actor = req.actor;

    if (!actor || (actor.type !== 'ADMIN' && actor.type !== 'RESTAURANT')) {
      throw new ForbiddenError('Only ADMIN or RESTAURANT actors can delete dishes');
    }

    const dish = await dishService.findOneById(dishId);
    if (!dish) {
      throw new DishNotFoundError(`Dish with id ${dishId} not found`);
    }

    await restaurantService.assertRestaurantOwnership(dish.restaurantId, actor);

    await dishService.softDelete(dishId, dish.restaurantId);

    logger.info({ id: dishId }, 'dish deleted');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Dish deleted successfully',
      data: null,
    });
  } catch (error) {
    logger.error(error, 'delete dish error');
    next(error);
  }
};
