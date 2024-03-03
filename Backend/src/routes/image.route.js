import { Router } from "express";
import { uploadImage } from "../controllers/upload.controllers.js";
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/upload').post(upload.single("file"),uploadImage);

export default router;