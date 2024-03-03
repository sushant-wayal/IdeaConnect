import { Router } from "express";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";
import { getMessages } from "../controllers/message.controllers.js";

const router = Router();

router.route("/:chatId").get(isLoggedIn, getMessages);

export default router;