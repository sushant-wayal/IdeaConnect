import { Router } from "express";
import { 
    publishIdea,
    updateProgress,
    checkLike,
    likeIdea,
    likedBy,
    intrested,
} from "../controllers/idea.controllers.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/publishIdea").post(publishIdea);
router.route("/updateProgress/:ideaId/:newProgress").get(updateProgress);
router.route("/checkLike/:ideaId/:username").get(checkLike);
router.route("/likeIdea/:ideaId/:username").get(likeIdea);
router.route("/likedBy/:ideaId").get(likedBy);
router.route("/intrested/:ideaId").get(isLoggedIn,intrested);

export default router;