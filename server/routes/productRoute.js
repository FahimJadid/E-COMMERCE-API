import express from "express";
import ProductController from "../controllers/productController.js";
import { isAuthenticatedUser, authorizedRoles } from "../middleware/auth.js";

const router = express.Router();

// define the page routes
router.route("/products").get(ProductController.getAllProducts);
router
  .route("/admin/product/new")
  .post(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    ProductController.createProduct
  );
router
  .route("/admin/product/:id")
  .put(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    ProductController.updateProduct
  );
router
  .route("/admin/product/:id")
  .delete(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    ProductController.deleteProduct
  );
router.route("/product/:id").get(ProductController.getProductDetails);

router
  .route("/review")
  .put(isAuthenticatedUser, ProductController.createProductReview);

router.route("/reviews").get(ProductController.getProductReviews);

router
  .route("/reviews")
  .delete(isAuthenticatedUser, ProductController.deleteReview);

export default router;
