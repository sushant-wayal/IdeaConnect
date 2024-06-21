import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  commentOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commentOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Idea",
    required: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);