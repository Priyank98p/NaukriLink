import mongoose, { Schema } from "mongoose";

const savedCandidateSchema = new Schema(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: "EmployerProfile",
      required: true,
      index: true,
    },

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "CandidateProfile",
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

// Prevent saving the same candidate multiple times
savedCandidateSchema.index(
  { employerId: 1, candidateId: 1 },
  { unique: true }
);

export const SavedCandidate = mongoose.model(
  "SavedCandidate",
  savedCandidateSchema
);