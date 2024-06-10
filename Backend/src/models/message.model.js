import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  senderUsername: String,
  // receiver: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  // },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "document"],
  },
  message: {
    type: String,
  },
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);