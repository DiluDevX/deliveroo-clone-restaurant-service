import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as restaurantService from '../../services/restaurant.database.service';
import { logger } from '../../utils/logger';
import { CommonResponseDTO, PaginatedResponseDTO } from '../../dtos/common.dto';
import {
  CreateRestaurantDTO,
  UpdateRestaurantDTO,
  ListRestaurantsQueryDTO,
  RestaurantIdParamsDTO,
  RestaurantResponseDTO,
  RestaurantOrgIdParamsDTO,
} from '../../dtos/restaurant.dto';
import { ForbiddenError, RestaurantNotFoundError } from '../../utils/errors';
import { Prisma, RestaurantStatus } from '@prisma/client';
import { assertCanManageRestaurantSettings } from '../../utils/actor-permissions';

function stripCommission(
  restaurant: RestaurantResponseDTO & { commissionPercentage: number },
  isAdmin: boolean
): RestaurantResponseDTO {
  if (isAdmin) {
    return restaurant;
  }
  const { commissionPercentage: _commissionPercentage, ...rest } = restaurant;
  return rest;
}

export const listRestaurants = async (
  req: Request<unknown, unknown, unknown, ListRestaurantsQueryDTO>,
  res: Response<PaginatedResponseDTO<RestaurantResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      cuisine,
      status,
      tags,
      rating,
      minDeliveryFee,
      maxDeliveryFee,
      minOrderValue,
      maxOrderValue,
      isOpen,
      page,
      limit,
      sort,
    } = req.query;

    const actor = req.actor;

    const parsedPage = page ? Number.parseInt(page, 10) : 1;
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 20;
    const skip = (parsedPage - 1) * parsedLimit;

    let orderBy: Prisma.RestaurantOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort) {
      const [field, direction] = sort.split(':');
      if (field && direction) {
        orderBy = { [field]: direction as 'asc' | 'desc' };
      }
    }

    const filters = {
      search,
      cuisine,
      status: status,
      tags: tags,
      rating: Number(rating),
      minDeliveryFee: Number(minDeliveryFee),
      maxDeliveryFee: Number(maxDeliveryFee),
      minOrderValue: Number(minOrderValue),
      maxOrderValue: Number(maxOrderValue),
      isOpen: isOpen === 'true',
    };

    const { data: restaurants, total } = await restaurantService.findMany(
      actor,
      filters,
      { skip, take: parsedLimit },
      orderBy
    );

    const isAdmin = actor?.type === 'ADMIN';
    const data = restaurants.map((r) =>
      stripCommission(r as RestaurantResponseDTO & { commissionPercentage: number }, isAdmin)
    );

    const totalPages = Math.ceil(total / parsedLimit);

    logger.info({
      msg: 'Restaurants listed',
      count: restaurants.length,
      page: parsedPage,
      limit: parsedLimit,
      total,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurants retrieved successfully',
      data,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error(error, 'list restaurants error');
    next(error);
  }
};

export const getRestaurant = async (
  req: Request<RestaurantIdParamsDTO>,
  res: Response<CommonResponseDTO>,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const actor = req.actor;

    const restaurant = await restaurantService.findOneById(restaurantId, actor);

    if (!restaurant) {
      throw new RestaurantNotFoundError(`Restaurant with id ${restaurantId} not found`);
    }

    const isAdmin = actor?.type === 'ADMIN';
    const data = stripCommission(
      restaurant as RestaurantResponseDTO & { commissionPercentage: number },
      isAdmin
    );

    logger.info({ id: restaurantId }, 'restaurant fetched');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant retrieved successfully',
      data,
    });
  } catch (error) {
    logger.error(error, 'get restaurant error');
    next(error);
  }
};

export const createRestaurant = async (
  req: Request<unknown, CommonResponseDTO<RestaurantResponseDTO>, CreateRestaurantDTO>,
  res: Response<CommonResponseDTO<RestaurantResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const actor = req.actor;

    if (actor?.type !== 'ADMIN') {
      throw new ForbiddenError('Only ADMIN actors can create restaurants');
    }

    const restaurant = await restaurantService.create({
      orgId: req.body.orgId,
      name: req.body.name,
      image: req.body.image,
      address: req.body.address,
      description: req.body.description,
      tags: req.body.tags,
      openingAt: req.body.openingAt,
      closingAt: req.body.closingAt,
      minimumValue: req.body.minimumValue,
      deliveryCharge: req.body.deliveryCharge,
      commissionPercentage: req.body.commissionPercentage,
      cuisine: req.body.cuisine,
      status: RestaurantStatus.ACTIVE,
    });

    logger.info({ id: restaurant.id }, 'restaurant created');

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant,
    });
  } catch (error) {
    logger.error(error, 'create restaurant error');
    next(error);
  }
};

export const getRestaurantByOrgId = async (
  req: Request<RestaurantOrgIdParamsDTO>,
  res: Response<CommonResponseDTO<RestaurantResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.actor?.type !== 'ADMIN') {
      throw new ForbiddenError('Only ADMIN actors can retrieve restaurants by orgId');
    }

    const restaurant = await restaurantService.findOneByOrgId(req.params.orgId);
    if (!restaurant) {
      throw new RestaurantNotFoundError('Restaurant not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant retrieved successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProvisionedRestaurant = async (
  req: Request<RestaurantOrgIdParamsDTO>,
  res: Response<CommonResponseDTO<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.actor?.type !== 'ADMIN') {
      throw new ForbiddenError('Only ADMIN actors can compensate restaurant provisioning');
    }

    const restaurant = await restaurantService.deleteProvisionedByOrgId(req.params.orgId);
    logger.warn({ id: restaurant.id, orgId: restaurant.orgId }, 'Provisioned restaurant removed');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Provisioned restaurant removed successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (
  req: Request<
    RestaurantIdParamsDTO,
    CommonResponseDTO<RestaurantResponseDTO>,
    UpdateRestaurantDTO
  >,
  res: Response<CommonResponseDTO<RestaurantResponseDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const actor = req.actor;

    assertCanManageRestaurantSettings(actor);

    await restaurantService.assertRestaurantOwnership(restaurantId, actor);

    const updateData = { ...req.body };

    if (actor.type === 'RESTAURANT') {
      delete updateData.commissionPercentage;
    }

    const restaurant = await restaurantService.update(restaurantId, updateData);

    const isAdmin = actor.type === 'ADMIN';
    const data = stripCommission(
      restaurant as RestaurantResponseDTO & { commissionPercentage: number },
      isAdmin
    );

    logger.info({ id: restaurantId }, 'restaurant updated');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant updated successfully',
      data,
    });
  } catch (error) {
    logger.error(error, 'update restaurant error');
    next(error);
  }
};

export const deleteRestaurant = async (
  req: Request<RestaurantIdParamsDTO>,
  res: Response<CommonResponseDTO>,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const actor = req.actor;

    if (actor?.type !== 'ADMIN') {
      throw new ForbiddenError('Only ADMIN actors can delete restaurants');
    }

    await restaurantService.softDelete(restaurantId);

    logger.info({ id: restaurantId }, 'restaurant deleted');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Restaurant deleted successfully',
      data: null,
    });
  } catch (error) {
    logger.error(error, 'delete restaurant error');
    next(error);
  }
};
