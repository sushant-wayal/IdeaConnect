import { Router } from "express";
import { sortGroupsAndChats } from "../controllers/chatsAndGroups.controller.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/").get(isLoggedIn, sortGroupsAndChats);

export default router;