import mongoose, { Schema } from "mongoose";

const savedJobSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true,
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Prevent saving the same job multiple times
savedJobSchema.index(
  { candidateId: 1, jobId: 1 },
  { unique: true }
);

export const SavedJob = mongoose.model(
  "SavedJob",
  savedJobSchema
);