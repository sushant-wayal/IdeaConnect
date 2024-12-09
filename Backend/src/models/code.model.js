import mongoose from "mongoose";

const codeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  codeFiles: [{
    path: String,
    name: String,
    content: String,
  }],
  chats: [{
    chatType: {
      type: String,
      enum: ["question", "answer"]
    },
    content: String,
  }]
}, { timestamps: true });

export const Code = mongoose.model("Code", codeSchema);