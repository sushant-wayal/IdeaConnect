import mongoose, { Schema } from "mongoose";

const ideaSchema = new Schema({
  ideaOf: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
  	type: String,
    required: true,
    trim: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  intrested: {
    type: Number,
    default: 0,
  },
  intrestedUser: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  includedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  media: [{
    src: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    }
  }],
  description: {
    type: String,
    required: true,
    trim: true,
  },
  steps: {
    type: [String],
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  noOfComments: {
    type: Number,
    default: 0,
  },
  comments: [{
  	type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
  noOfShare: {
    type: Number,
    default: 0,
  },
  sharedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdBy: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export const Idea = mongoose.model("Idea", ideaSchema);