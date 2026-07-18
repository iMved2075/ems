import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  secure: true,
});

const uploadImage = async (filePath: string): Promise<string> => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new ApiError(400, "File path is required");
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "ems",
    });
    console.log("Image uploaded to Cloudinary:", result.secure_url);
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new ApiError(500, "Failed to upload image");
  }
};

export { uploadImage };