import mongoose, { Schema } from "mongoose";

const employerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    logo: {
      type: String,
    },
    banner:{
      type:String
    },
    organizationType: {
      type: String,
      enum: ["Public", "Private", "Non-Profit / NGO", "Government",]
    },
    industryType:{
      type: String,
      enum:["Information Technology & Software", "Healthcare & Medical", "Finance & Banking", "Education & Training", "Manufacturing & Engineering", ""]
    },
    teamSize: {
      type: Number,
    },
    foundedYear: {
      type: Number,
      required: true,
    },
    website: {
      type: String,
      trim: true,
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const EmployerProfile = mongoose.model(
  "EmployerProfile",
  employerProfileSchema,
);
