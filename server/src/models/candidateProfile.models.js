import mongoose, { Schema } from "mongoose";

const candidateProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dolvuw9vy/image/upload/v1777029295/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158_kgefvq.webp",
      trim: true,
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
      trim: true,
    },
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    personalWebsite: {
      type: String,
      trim: true,
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
