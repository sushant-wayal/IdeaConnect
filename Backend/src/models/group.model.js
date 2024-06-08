import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Idea",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    unread: {
      type: Number,
      default: 0,
    },
  }],
  profileImage: {
    type: String,
    default: "defaultGroup.jpg",
  },
  lastMessage: {
    type: String,
    default: "No message yet",
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  }],
}, { timestamps: true });

export const Group = mongoose.model("Group", groupSchema);