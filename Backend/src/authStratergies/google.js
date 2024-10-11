import { createAccessAndRefreshToken } from '../controllers/user.controllers.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import dotenv from 'dotenv';

dotenv.config({
  path: './.env',
});

const project_mode = process.env.PROJECT_MODE || 'development';

export const googleAuth = async (_accessToken, _refreshToken, profile, done) => {
  console.log("profile", profile);
  const { sub : googleId, email, picture: profileImage, given_name: firstName, family_name: lastName } = profile._json;
  const user = await User.findOne({ email });
  if (user) {
    const { accessToken, refreshToken } = await createAccessAndRefreshToken(user._id);
    return done(null, { user, accessToken, refreshToken });
  }
  const newUser = await User.create({
    password: googleId,
    email,
    profileImage,
    firstName,
    lastName,
    username: email,
  });
  const { accessToken, refreshToken } = await createAccessAndRefreshToken(newUser._id);
  return done(null, { user : newUser, accessToken, refreshToken });
}

export const googleAuthResponse = asyncHandler(async (req, res) => {
  console.log("req.user", req.user);
  const { user, accessToken, refreshToken } = req.user;
  const baseUrl = project_mode == 'production' ? '/' : 'http://localhost:5173/';
  res.redirect(
    302,
    `${baseUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${JSON.stringify(user)}`);
});