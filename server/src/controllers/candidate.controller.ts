import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { CandidateProfile } from "../models/candidateProfile.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../services/Cloudinary.js";
import {
  getOptionalNumber,
  getOptionalString,
  getOptionalStringArray,
  getRequestBody,
} from "../utils/requestBody.js";

const updatePersonalInfo = asyncHandler(async (req, res) => {
  const body = getRequestBody(req.body);
  const fullName = getOptionalString(body, "fullName");
  const headline = getOptionalString(body, "headline");
  const bio = getOptionalString(body, "bio");
  const experience = getOptionalStringArray(body, "experience");
  const education = getOptionalStringArray(body, "education");
  const personalWebsite = getOptionalString(body, "personalWebsite");
  const nationality = getOptionalString(body, "nationality");
  const dateOfBirth = getOptionalString(body, "dateOfBirth");
  const gender = getOptionalString(body, "gender");
  const phone = getOptionalNumber(body, "phone");
  const address = getOptionalString(body, "address");
  const skills = getOptionalStringArray(body, "skills");
  const projects = getOptionalStringArray(body, "projects");
  const currentUserId = req.user?._id;

  if (!currentUserId) {
    throw new ApiError(401, "Unauthorized access");
  }

  if (
    !fullName &&
    !education &&
    !experience &&
    !bio &&
    !personalWebsite &&
    !headline &&
    !nationality &&
    !dateOfBirth &&
    !gender &&
    !phone &&
    !address &&
    !skills &&
    !projects
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

  const updateFields: Record<string, unknown> = {};

  if (headline) updateFields.headline = headline;
  if (bio) updateFields.bio = bio;
  if (experience) updateFields.experience = experience;
  if (education) updateFields.education = education;
  if (personalWebsite) updateFields.personalWebsite = personalWebsite;
  if (nationality) updateFields.nationality = nationality;
  if (dateOfBirth) {
    const parsedDateOfBirth = new Date(dateOfBirth);
    if (Number.isNaN(parsedDateOfBirth.getTime())) {
      throw new ApiError(400, "dateOfBirth must be a valid date");
    }
    updateFields.dateOfBirth = parsedDateOfBirth;
  }
  if (gender) updateFields.gender = gender;
  if (phone) updateFields.phone = phone;
  if (address) updateFields.address = address;
  if (skills) updateFields.skills = skills;
  if (projects) updateFields.projects = projects;

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
  if (!currentUserId) {
    throw new ApiError(401, "Unauthorized access");
  }
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
