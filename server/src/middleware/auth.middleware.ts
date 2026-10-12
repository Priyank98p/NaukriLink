import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getRequiredEnv } from "../utils/env.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }

    const decodedToken = jwt.verify(
      token,
      getRequiredEnv("ACCESS_TOKEN_SECRET"),
    );
    if (
      typeof decodedToken !== "object" ||
      decodedToken === null ||
      typeof decodedToken._id !== "string"
    ) {
      throw new ApiError(401, "Invalid token");
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(402, "Invalid token");
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      400,
      error instanceof Error ? error.message : "Invalid request",
    );
  }
});

export { verifyJWT };
