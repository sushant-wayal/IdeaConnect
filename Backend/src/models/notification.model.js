import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
  notifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  notifiedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  IdeaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Idea",
  },
  username: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["follow", "intrested", "included", "liked", "commented"],
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);