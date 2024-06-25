import { Router } from "express";
import {
  getAllNotifications,
  getNoOfUnreadNotifications
} from "../controllers/notification.controller.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/").get(isLoggedIn, getAllNotifications);
router.route("/unread").get(isLoggedIn, getNoOfUnreadNotifications);

export default router;