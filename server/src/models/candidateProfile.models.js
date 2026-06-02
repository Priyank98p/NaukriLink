import mongoose, { Schema } from "mongoose";

const candidateProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
    },
    phone: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      trim: true,
    },
    education: {
      type: [String],
      required: true,
    },
    experience: {
      type: [String],
      trim: true,
    },
    projects: {
      type: [String],
    },
    resumeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    socialLinks: {
      github: String,
      linkedin: String,
      portfolio: String,
    },
    isProfilePublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const CandidateProfile = mongoose.model(
  "CandidateProfile",
  candidateProfileSchema,
);
