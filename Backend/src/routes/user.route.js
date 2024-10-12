import { Router } from "express";
import { 
  registerUser,
  login,
  activeUser,
  feed,
  Profile,
  userInfo,
  follow,
  isFollowing,
  getIdeas,
  logout,
  forgotPassword,
  resetPassword
} from "../controllers/user.controllers.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(login);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
router.route("/activeUser").get(isLoggedIn, activeUser);
router.route("/feed").get(isLoggedIn, feed);
router.route("/profile/:username").get(Profile);
router.route("/userInfo/:userId").get(userInfo);
router.route("/follow/:followingUsername").post(isLoggedIn, follow);
router.route("/checkFollow/:activeUsername/:username").get(isFollowing);
router.route("/idea/:username/:activeUsername").get(getIdeas);
router.route("/logout").post(logout);

export default router;