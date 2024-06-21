import { Router } from "express";
import {
  addComment,
  getComments,
} from "../controllers/comment.controller.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/add").post(isLoggedIn, addComment);
router.route("/:ideaId").get(getComments);

export default router;