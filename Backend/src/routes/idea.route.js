import { Router } from "express";
import {
  publishIdea,
  updateProgress,
  checkLike,
  likeIdea,
  likedBy,
  intrested,
  include,
  share,
  myIdeas,
  exploreIdeas,
  collaboratedIdeas,
  intrestedIdeas,
  specificCategoryIdeas,
  searchIdeas,
  specificIdea
} from "../controllers/idea.controllers.js";
import { isLoggedIn } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/publishIdea").post(publishIdea);
router.route("/updateProgress/:ideaId/:newProgress").get(updateProgress);
router.route("/checkLike/:ideaId/:username").get(checkLike);
router.route("/likeIdea/:ideaId/:username").get(likeIdea);
router.route("/likedBy/:ideaId").get(likedBy);
router.route("/intrested/:ideaId").get(isLoggedIn,intrested);
router.route("/include/:ideaId/:userId").get(isLoggedIn,include);
router.route("/share/:ideaId").get(isLoggedIn,share);
router.route("/myIdeas").get(isLoggedIn,myIdeas);
router.route("/exploreIdeas").get(isLoggedIn, exploreIdeas);
router.route("/collaboratedIdeas").get(isLoggedIn, collaboratedIdeas);
router.route("/intrestedIdeas").get(isLoggedIn, intrestedIdeas);
router.route("/category/:category").get(isLoggedIn, specificCategoryIdeas);
router.route("/search/:query").get(isLoggedIn, searchIdeas);
router.route("/specificIdea/:ideaId").get(isLoggedIn, specificIdea);

export default router;