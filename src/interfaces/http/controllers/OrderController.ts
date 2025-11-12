import { Response } from 'express';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { placeOrder } from '../../../application/use-cases/orders/placeOrder';
import { listUserOrders } from '../../../application/use-cases/orders/listUserOrders';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSuccess, sendError } from '../utils/responseHelper';

export class OrderController {
  constructor(private orderRepo: OrderRepository) {}

  async placeOrder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', null, 401);
      }

      const result = await placeOrder(this.orderRepo, {
        userId: req.user.userId,
        description: req.body.description,
        items: req.body.items,
      });

      sendSuccess(res, result, 'Order placed successfully', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  }

  async listUserOrders(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', null, 401);
      }

      const result = await listUserOrders(this.orderRepo, {
        userId: req.user.userId,
      });

      sendSuccess(res, result.orders, 'Orders retrieved successfully');
    } catch (error: any) {
      sendError(res, error.message, null, 500);
    }
  }
}

