import { Router } from "express";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";
import {
  getMessages,
  deleteMessage
} from "../controllers/message.controllers.js";

const router = Router();

router.route("/:chatId").get(isLoggedIn, getMessages);
router.route("/:messageId/:chatOrGroupId").delete(isLoggedIn, deleteMessage);

export default router;