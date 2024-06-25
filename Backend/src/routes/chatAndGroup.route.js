import { Router } from "express";
import {
  sortGroupsAndChats,
  totalUnreadMessages,
  getGroupId
} from "../controllers/chatsAndGroups.controller.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/").get(isLoggedIn, sortGroupsAndChats);
router.route("/unread").get(isLoggedIn, totalUnreadMessages);
router.route("/groupId/:ideaId").get(isLoggedIn, getGroupId);

export default router;