import { Router } from "express";
import {
  sortGroupsAndChats,
  totalUnreadMessages
} from "../controllers/chatsAndGroups.controller.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/").get(isLoggedIn, sortGroupsAndChats);
router.route("/unread").get(isLoggedIn, totalUnreadMessages);

export default router;