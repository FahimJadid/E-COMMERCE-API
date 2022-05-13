import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to gain Access", 401));
  }

  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await UserModel.findById(decodeData.id);

  next();
});

const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: '${req.user.role}' is not allowed to gain access`,
          403
        )
      );
    }
    next();
  };
};

export { isAuthenticatedUser, authorizedRoles };
