import { Router } from "express";
import { getChats } from "../controllers/chat.controllers.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/").get(isLoggedIn, getChats);

export default router;