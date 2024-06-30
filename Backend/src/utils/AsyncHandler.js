import { ApiResponse } from "./ApiResponse.js";

const asyncHandler = requestHandler => {
  return (req, res, next) => {
    // Promise.resolve(requestHandler(req, res, next)).catch(error => {next(error)});
    Promise.resolve(requestHandler(req, res, next)).catch(() => {res.status(500).json(new ApiResponse(500, null, 'Internal server error'))});
  };
};

export { asyncHandler };