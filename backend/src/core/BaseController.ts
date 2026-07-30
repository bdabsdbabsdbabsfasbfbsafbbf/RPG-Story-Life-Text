import { Request, Response } from 'express';

export abstract class BaseController {
  protected success<T>(res: Response, data: T, statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  protected created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  protected noContent(res: Response): Response {
    return res.status(204).send();
  }

  protected error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: unknown
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(errors ? { details: errors } : {}),
      },
      timestamp: new Date().toISOString(),
    });
  }

  protected paginated<T>(
    res: Response,
    items: T[],
    total: number,
    page: number,
    limit: number
  ): Response {
    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    });
  }
}
