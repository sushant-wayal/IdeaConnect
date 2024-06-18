import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";

export const uploadImage = asyncHandler(async (req, res) => {
  const result = await uploadOnCloudinary(req.file.path);
  console.log("file path",req.file.path);
  console.log("result",result);
  if (result.resource_type == "video" && result.is_audio == true) result.resource_type = "audio";
  if (result.resource_type == "raw") result.resource_type = "document";
  if (result.resource_type == "image" && result.format == "pdf") result.resource_type = "document";
  if (result.format == "webm") result.resource_type = "audio";
  console.log("upload url",result.url, "type", result.resource_type);
  return res.status(201).json(new ApiResponse(201, {
    url: result.url,
    type: result.resource_type
  }, 'Media uploaded successfully'));
});