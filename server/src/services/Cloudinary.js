import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localPath) => {
  try {
    if (!localPath) return null;

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

const deleteFromCloudinary = async (url) => {
  try {
    if (!url || !url.includes("cloudinary.com")) return null;

    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    const withVersion = parts[1];
    const withoutVersion = withVersion.replace(/^v\d+\//, "");
    const publicId = withoutVersion.replace(/\.[^/.]+$/, "");

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);
    return result;
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
