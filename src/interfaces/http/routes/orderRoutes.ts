import { Router } from 'express';
import { z } from 'zod';
import { OrderController } from '../controllers/OrderController';
import { validateMiddleware } from '../middlewares/validateMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { JwtService } from '../../../infrastructure/services/jwtService';

const placeOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    ).min(1),
  }),
});

export function createOrderRoutes(orderController: OrderController, jwtService: JwtService) {
  const router = Router();

  router.post(
    '/',
    authMiddleware(jwtService),
    validateMiddleware(placeOrderSchema),
    orderController.placeOrder.bind(orderController)
  );

  router.get(
    '/',
    authMiddleware(jwtService),
    orderController.listUserOrders.bind(orderController)
  );

  return router;
}

