import User from "../models/user.model.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, username, password, gender } = req.body;

  if (!fullName || !username || !password || !gender) {
    return next(new errorHandler("Please provide all required fields", 400));
  }

  const userExists = await User.findOne({ username });
  if (userExists) {
    return next(new errorHandler("User already exists", 400));
  }

  const hashPassword = await bcrypt.hash(password, 10);
  if (!hashPassword) {
    return next(new errorHandler("Error hashing password", 500));
  }

  const avatarType = gender === "male" ? "boy" : "girl";
  const avatar = `https://avatar.iran.liara.run/public/${avatarType}?username=${username}`;

  const newUser = await User.create({
    fullName,
    username,
    password: hashPassword,
    gender,
    avatar,
  });

  const tokenData = {
    _id: newUser._id,
  }

  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res
  .status(200)
  .cookie("token", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  })
  .json({
    success: true,
    responseData: {
      newUser,
      token,
    },
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new errorHandler("Please provide all required fields", 400));
  }

  const user = await User.findOne({ username });
  if (!user) {
    return next(
      new errorHandler("Invalid credentials", 400)
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new errorHandler("Invalid credentials", 401));
  }

  const tokenData = {
    _id: user._id,
  }

  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      responseData: {
        user,
        token,
      },
    });
});

export const getProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  res.status(200).json({
    success: true,
    responseData: user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logout successfull!",
    });
});

export const getOtherUsers = asyncHandler(async (req, res, next) => {
  const otherUsers = await User.find({ _id: { $ne: req.user._id } });

  res.status(200).json({
    success: true,
    responseData: otherUsers,
  });
});