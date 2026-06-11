import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { CandidateProfile } from "../models/candidateProfile.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../services/Cloudinary.js";

const updatePersonalInfo = asyncHandler(async (req, res) => {
  const { fullName, headline, bio, experience, education, personalWebsite } =
    req.body;
  const currentUserId = req.user?._id;

  if (
    !fullName &&
    !education &&
    !experience &&
    !bio &&
    !personalWebsite &&
    !headline
  ) {
    throw new ApiError(400, "At least one field is required");
  }

  // Find current user
  const currentUser = await User.findById(currentUserId);

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  // Update fullName in User collection
  if (fullName) {
    currentUser.fullName = fullName;
    await currentUser.save({ validateBeforeSave: false });
  }

  const updateFields = {};

  if (headline) updateFields.headline = headline;
  if (bio) updateFields.bio = bio;
  if (experience) updateFields.experience = experience;
  if (education) updateFields.education = education;
  if (personalWebsite) updateFields.personalWebsite = personalWebsite;

  const avatarLocalPath = req.file?.path;
  const existingProfile = await CandidateProfile.findOne({
    userId: currentUserId,
  });
  // Handle avatar upload if file exists
  if (avatarLocalPath) {
    // Delete old avatar from cloudinary
    if (
      existingProfile?.avatar &&
      existingProfile.avatar.includes("cloudinary.com")
    ) {
      await deleteFromCloudinary(existingProfile.avatar);
    }
    const uploadAvatar = await uploadOnCloudinary(avatarLocalPath);

    if (!uploadAvatar?.url) {
      throw new ApiError(500, "Error while uploading avatar");
    }

    updateFields.avatar = uploadAvatar.url;
  }

  // Create profile if not exists, update if exists
  const profile = await CandidateProfile.findOneAndUpdate(
    {
      userId: currentUserId,
    },
    {
      $set: updateFields,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );

  const updatedUser = await User.findById(currentUserId).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(new ApiResponse(201, { user: updatedUser, profile }));
});

const addOrUpdateResume = asyncHandler(async (req, res) => {
  const resumeLocalPath = req.file?.path;
  const currentUserId = req.user?._id;
  if (!resumeLocalPath) {
    throw new ApiError(400, "Resume is required");
  }

  const currentUser = await User.findById(currentUserId);

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const existingProfile = await CandidateProfile.findOne({
    userId: currentUserId,
  });

  // Handle resume upload if file exists
  if (resumeLocalPath) {
    if (
      existingProfile?.resumeUrl &&
      existingProfile?.resumeUrl.includes("cloudinary.com")
    ) {
      await deleteFromCloudinary(existingProfile.resumeUrl);
      console.log("delete done");
    }
  }

  const uploadResume = await uploadOnCloudinary(resumeLocalPath);
  if (!uploadResume?.url) {
    throw new ApiError(500, "Error while uploading resume");
  }

  const resume = await CandidateProfile.findOneAndUpdate(
    {
      userId: currentUserId,
    },
    {
      $set: {
        resumeUrl: uploadResume?.url,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );

  return res.status(200).json(new ApiResponse(200, resume, "Resume updated!"));
});

export { updatePersonalInfo, addOrUpdateResume };
