import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "applied",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "selected",
        "rejected",
      ],
      default: "applied",
    },

    coverLetter: {
      type: String,
      trim: true,
    },

    resumeSnapshotUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications to the same job
applicationSchema.index(
  { jobId: 1, candidateId: 1 },
  { unique: true }
);

export const Application = mongoose.model(
  "Application",
  applicationSchema
);