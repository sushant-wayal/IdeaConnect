import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  console.log("uploading file to cloudinary", localFilePath);
  if (!localFilePath) return null;
  let res;
  try {
    res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
  } catch {
    res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw",
    });
  }
  fs.unlinkSync(localFilePath);
  console.log("file uploaded successfully",res.url);
  return res;
}