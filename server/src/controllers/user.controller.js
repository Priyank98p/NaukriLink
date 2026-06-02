import { User } from "../models/user.models.js";
import { Verification } from "../models/verification.models.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/sendEmail.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import crypto from "crypto"

const OTP_EXPIRY_MINUTES = 10;

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const sendUserVerificationOtp = async (user) => {
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Verification.findOneAndUpdate(
    { email: user.email },
    {
      userId: user._id,
      email: user.email,
      otp: hashedOtp,
      expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await sendVerificationEmail(user.email, otp);
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(401, "Something went wrong while generating tokens");
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, role } = req.body;

  if (!fullName || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const user = await User.create({
    fullName,
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    role,
    isVerified: false,
  });

  await sendUserVerificationOtp(user);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "Failed to create account");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, verificationRequired: true },
        "User registered successfully. OTP sent to email.",
      ),
    );
});

const emailVerification = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isVerified: true }, "Email already verified"),
      );
  }

  const verification = await Verification.findOne({ email: normalizedEmail });

  if (!verification) {
    throw new ApiError(
      400,
      "OTP not found or expired. Please request a new OTP.",
    );
  }

  if (verification.expiresAt < new Date()) {
    await Verification.deleteOne({ _id: verification._id });
    throw new ApiError(400, "OTP has expired. Please request a new OTP.");
  }

  const isOtpValid = await bcrypt.compare(otp, verification.otp);

  if (!isOtpValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.isVerified = true;
  await user.save({ validateBeforeSave: false });
  await Verification.deleteOne({ _id: verification._id });

  sendWelcomeEmail(user.email, user.username).catch((error) =>
    console.error("Welcome email error:", error),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isVerified: true },
        "Email verified successfully",
      ),
    );
});

const resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  await sendUserVerificationOtp(user);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP resent successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "-password -refreshToken",
  );
  if (!user) {
    throw new ApiError(400, "User doesn't exist");
  }

  const isPasswordValidOrNot = await user.isPasswordCorrect(password);

  if (!isPasswordValidOrNot) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser }, "User login successfull"),
    );
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfull"));
});
export {
  userLogin,
  registerUser,
  userLogout,
  emailVerification,
  resendVerificationOtp,
};
