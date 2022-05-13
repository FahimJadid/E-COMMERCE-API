import express from "express";
import UserController from "../controllers/userController.js";
import { isAuthenticatedUser, authorizedRoles } from "../middleware/auth.js";

const router = express.Router();

// define the page routes
router.route("/register").post(UserController.registerUser);

router.route("/login").post(UserController.loginUser);

router.route("/password/forgot").post(UserController.forgotPassword);

router.route("/password/reset/:token").put(UserController.resetPassword);

router.route("/logout").get(UserController.logout);

router
  .route("/mydetails")
  .get(isAuthenticatedUser, UserController.getUserDetails);

router
  .route("/password/update")
  .put(isAuthenticatedUser, UserController.updatePassword);

router
  .route("/mydetails/update")
  .put(isAuthenticatedUser, UserController.updateUserProfile);

router
  .route("/admin/users")
  .get(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    UserController.getAllUser
  );

router
  .route("/admin/user/:id")
  .get(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    UserController.getSingleUser
  );

router
  .route("/admin/user/:id")
  .put(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    UserController.updateUserRole
  );

router
  .route("/admin/user/:id")
  .delete(
    isAuthenticatedUser,
    authorizedRoles("admin"),
    UserController.deleteUser
  );

export default router;
