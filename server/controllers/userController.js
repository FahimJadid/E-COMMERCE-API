import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import UserModel from "../models/userModel.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

class UserController {
  static registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await UserModel.create({
      name,
      email,
      password,
      avatar: {
        public_id: "sample id",
        url: "profile_url",
      },
    });

    sendToken(user, 201, res);
  });

  // Login User
  static loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Verification of User Password and Email
    if (!email || !password) {
      return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await UserModel.findOne({ email: email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    sendToken(user, 200, res);
  });

  //Logout user

  static logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "Logged Out Successfully",
    });
  });

  //Forgot password

  static forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    //Getting Reset Password Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf this email have not been requested then ignore it`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email Successfully send to the ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler(error.message, 500));
    }
  });

  //Reset password
  static resetPassword = catchAsyncErrors(async (req, res, next) => {
    //Token Hash Created
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "The Reset Password Token is invalid or has expired",
          400
        )
      );
    }
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  });

  //Get User Details
  static getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await UserModel.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  });

  //Update Password
  static updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await UserModel.findById(req.user.id).select("+password");

    const isPasswordMatched = user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is Incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
  });

  //Update User Profile (Personal)
  static updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const newData = {
      name: req.body.name,
      email: req.body.email,
    };
    //Cloudinary implimentation

    const user = await UserModel.findByIdAndUpdate(req.user.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
    });
  });

  //Get All users (ADMIN)
  static getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await UserModel.find();

    res.status(200).json({
      success: true,
      users,
    });
  });

  //Get Single users by (ADMIN)
  static getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorHandler(`This ${req.params.id} Id does not exist as a User`)
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  });

  //Update User Role (Admin)
  static updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    const user = await UserModel.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!user) {
      return next(
        new ErrorHandler(
          `This ${req.params.id} Id does not exist as a User`,
          400
        )
      );
    }
    res.status(200).json({
      success: true,
      message: "User Updated Successfully",
    });
  });

  //Delete User (Admin)
  static deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await UserModel.findById(req.params.id);
    // We will remove Cloudinary later

    if (!user) {
      return next(
        new ErrorHandler(
          `This ${req.params.id} Id does not exist as a User`,
          400
        )
      );
    }
    await user.remove();
    res.status(200).json({
      success: true,
      message: "Selected User Deleted Successfully",
    });
  });
}

export default UserController;
