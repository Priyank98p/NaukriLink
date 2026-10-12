import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import type { UploadApiResponse } from "cloudinary";
import { getRequiredEnv } from "../utils/env.js";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
  api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
  secure: true,
});

const uploadOnCloudinary = async (
  localPath: string | undefined,
): Promise<UploadApiResponse | null> => {
  if (!localPath) return null;

  try {
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    console.log("File uploaded successfully", response.url);
    fs.unlinkSync(localPath);
    return response;
  } catch (error) {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    console.log("File upload failed", error);
    return null;
  }
};

const deleteFromCloudinary = async (url: string | undefined) => {
  try {
    if (!url || !url.includes("cloudinary.com")) return null;

    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    // Extract the path after /upload/ and remove the version prefix (e.g., v1777029295/)
    const urlPath = parts.at(1);
    if (!urlPath) return null;
    const withoutVersion = urlPath.replace(/^v\d+\//, "");

    // Remove file extension to get public ID
    const publicId = withoutVersion.substring(
      0,
      withoutVersion.lastIndexOf("."),
    );

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);
    return result;
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
