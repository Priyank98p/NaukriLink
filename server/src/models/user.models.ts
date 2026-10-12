import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getJwtExpirationSeconds, getRequiredEnv } from "../utils/env.js";

export interface User {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: "candidate" | "employer" | "admin";
  status: "active" | "suspended" | "deleted";
  isVerified: boolean;
  refreshToken?: string | undefined;
  resetPasswordToken?: string | undefined;
  resetPasswordTokenExpiry?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

interface UserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateResetPasswordToken(): string;
}

type UserModel = Model<User, object, UserMethods>;
export type UserDocument = HydratedDocument<User, UserMethods>;

const userSchema = new Schema<User, UserModel, UserMethods>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["candidate", "employer", "admin"],
      default: "candidate",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
      index: { expires: 600 },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullName: this.fullName,
      email: this.email,
    },
    getRequiredEnv("ACCESS_TOKEN_SECRET"),
    {
      expiresIn: getJwtExpirationSeconds("ACCESS_TOKEN_EXPIRY"),
    },
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
    },
    getRequiredEnv("REFRESH_TOKEN_SECRET"),
    {
      expiresIn: getJwtExpirationSeconds("REFRESH_TOKEN_EXPIRY"),
    },
  );
};

userSchema.methods.generateResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(25).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};
export const User = mongoose.model<User, UserModel>("User", userSchema);
