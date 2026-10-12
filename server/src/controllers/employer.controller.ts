import { EmployerProfile } from "../models/EmployerProfile.models.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../services/Cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getOptionalNumber,
  getOptionalString,
  getOptionalStringRecord,
  getRequestBody,
} from "../utils/requestBody.js";

const employerProfileSetup = asyncHandler(async (req, res) => {
  const body = getRequestBody(req.body);
  const companyName = getOptionalString(body, "companyName");
  const about = getOptionalString(body, "about");
  const organizationType = getOptionalString(body, "organizationType");
  const industryType = getOptionalString(body, "industryType");
  const teamSize = getOptionalNumber(body, "teamSize");
  const foundedYear = getOptionalNumber(body, "foundedYear");
  const website = getOptionalString(body, "website");
  const socialLinks = getOptionalStringRecord(body, "socialLinks");
  const contactPhone = getOptionalString(body, "contactPhone");
  const address = getOptionalString(body, "address");

  if (
    !companyName &&
    !about &&
    !organizationType &&
    !industryType &&
    !teamSize &&
    !foundedYear &&
    !website &&
    !socialLinks &&
    !contactPhone &&
    !address
  ) {
    throw new ApiError(400, "At least one field is required");
  }

  const currentUser = await User.findById(req.user?._id);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const addOrUpdateFields: Record<string, unknown> = {};

  if (companyName) addOrUpdateFields.companyName = companyName;
  if (about) addOrUpdateFields.about = about;
  if (organizationType) addOrUpdateFields.organizationType = organizationType;
  if (industryType) addOrUpdateFields.industryType = industryType;
  if (teamSize) addOrUpdateFields.teamSize = teamSize;
  if (foundedYear) addOrUpdateFields.foundedYear = foundedYear;
  if (website) addOrUpdateFields.website = website;
  if (socialLinks) addOrUpdateFields.socialLinks = socialLinks;
  if (contactPhone) addOrUpdateFields.contactPhone = contactPhone;
  if (address) addOrUpdateFields.address = address;

  const files = req.files;
  const logoLocalPath =
    files && !Array.isArray(files) ? files.logo?.[0]?.path : undefined;
  const bannerLocalPath =
    files && !Array.isArray(files) ? files.banner?.[0]?.path : undefined;

  const uploadLogo = await uploadOnCloudinary(logoLocalPath);
  const uploadBanner = await uploadOnCloudinary(bannerLocalPath);

  if (!uploadLogo?.url || !uploadBanner?.url) {
    throw new ApiError(500, "Error while uploading files")
  }
  addOrUpdateFields.logo = uploadLogo.url
  addOrUpdateFields.banner = uploadBanner.url

  const createProfile = await EmployerProfile.findOneAndUpdate(
    { userId: currentUser._id },
    {
      $set: {
        ...addOrUpdateFields,
        contactEmail: currentUser.email,
      },
      $setOnInsert: {
        userId: currentUser._id,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  return res.status(200).json(
    new ApiResponse(200, createProfile, "Employer profile updated"),
  );
});

export { employerProfileSetup };
