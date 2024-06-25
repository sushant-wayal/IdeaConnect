import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
  	type: String,
  	required: [true, "Password is required"],
    trim: true,
  },
  firstName: {
  	type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  country: String,
  countryCode: String,
  phoneNumber: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  DOB: Date,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  bio: String,
  defaultProfileImage: {
  	type: String,
    default: "defaultOther.jpg",
  },
  profileImage: {
    type: String,
    default: "defaultOther.jpg",
  },
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  noOfIdeas: {
    type: Number,
    default: 0,
  },
  followersList: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  followingList: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
	ideas: [{
  	type: Schema.Types.ObjectId,
    ref: "Idea",
  }],
  chats: [{
    type: Schema.Types.ObjectId,
  	ref: "Chat",
  }],
  groups: [{
    type: Schema.Types.ObjectId,
    ref: "Group",
  }],
  intrestedIdeas: [{
    type: Schema.Types.ObjectId,
    ref: "Idea",
  }],
  notifications: [{
    type: Schema.Types.ObjectId,
    ref: "Notification",
  }],
  refreshToken: String,
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
})

userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.getAccessToken = function () {
  return jwt.sign(
		{ 
      id: this._id,
      username: this.username,
      email: this.email,
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
}

userSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    { 
      id: this._id,
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
}

export const User = mongoose.model("User", userSchema);