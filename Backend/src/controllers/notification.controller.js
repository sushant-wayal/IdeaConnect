import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Notification } from '../models/notification.model.js';

export const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ notifiedTo: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { notifications }));
});

export const getNoOfUnreadNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ notifiedTo: req.user.id, seen: false });
  res.status(200).json(new ApiResponse(200, { noOfNotifications: notifications.length }));
});