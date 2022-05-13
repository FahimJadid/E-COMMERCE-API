import OrderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

class OrderController {
  //Create New Order
  static newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    const order = await OrderModel.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
    res.status(201).json({
      success: true,
      order,
    });
  });

  // get Single Order
  static getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await OrderModel.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHandler("This Id does not have any order", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  });

  // get logged in user  Orders
  static myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await OrderModel.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      orders,
    });
  });

  // get All Orders -Admin
  static getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await OrderModel.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  });
  // update Order Status -- Admin
  static updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("This Id does not have any order", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("Order has already been delivered", 400));
    }

    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (ord) => {
        await updateStock(ord.product, ord.quantity);
      });
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  });

  // delete Order -- Admin
  static deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("This Id does not have any order", 404));
    }

    await order.remove();

    res.status(200).json({
      success: true,
    });
  });
}

async function updateStock(id, quantity) {
  const product = await productModel.findById(id);

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

export default OrderController;
