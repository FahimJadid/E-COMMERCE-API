import express from "express";
import OrderController from "../controllers/ordercontroller.js";
import { isAuthenticatedUser, authorizedRoles } from "../middleware/auth.js";

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, OrderController.newOrder);
router
  .route("/order/:id")
  .get(isAuthenticatedUser, OrderController.getSingleOrder);

router
  .route("/orders/myorder")
  .get(isAuthenticatedUser, OrderController.myOrders);

router
  .route("/admin/orders")
  .get(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    OrderController.getAllOrders
  );

router
  .route("/admin/order/:id")
  .put(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    OrderController.updateOrder
  );

router
  .route("/admin/order/:id")
  .delete(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    OrderController.deleteOrder
  );

export default router;
