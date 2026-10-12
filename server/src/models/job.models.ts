import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: "EmployerProfile",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: String,
    },
    requirements: {
      type: [String],
      required: true,
    },
    benefits: {
      type: String,
    },
    skillsRequired: {
      type: [String],
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior", "lead"],
    },
    salaryMin: {
      type: Number,
    },
    salaryMax: {
      type: Number,
    },
    currency: {
      type: String,
    },
    location: {
      type: String,
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
    },
    workMode: {
      type: String,
      enum: ["remote", "hybrid", "on-site"],
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "open", "closed", "archived"],
      default: "draft",
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Job = mongoose.model("Job", jobSchema);
