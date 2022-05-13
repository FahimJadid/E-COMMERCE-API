import productModel from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ApiFeatures from "../utils/apiFeatures.js";

class ProductController {
  //Create Product for - Admin
  static createProduct = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.id;
    const product = await productModel.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  });

  //Get all product
  static getAllProducts = catchAsyncErrors(async (req, res) => {
    //Pagination
    const resultPerPage = 5;
    const productCount = await productModel.countDocuments();
    const apiFeature = new ApiFeatures(productModel.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({
      success: true,
      products,
    });
  });

  // Get Product Details
  static getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      product,
      productCount,
    });
  });

  //Update
  static updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await productModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  });

  //Delete
  static deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    await productModel.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  });

  //Create Review or Update Review
  static createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    const product = await productModel.findById(productId);
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  });

  //Get all reviews of a single product
  static getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await productModel.findById(req.query.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  });

  //Delete Review

  static deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await productModel.findById(req.query.productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
      avg += rev.rating;
    });

    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length;
    await productModel.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
    });
  });
}

export default ProductController;
