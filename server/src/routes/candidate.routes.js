import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addOrUpdateResume,
  updatePersonalInfo,
} from "../controllers/candidate.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router
  .route("/update-info")
  .post(verifyJWT, upload.single("avatar"), updatePersonalInfo);
router
  .route("/update-resume")
  .patch(verifyJWT, upload.single("resume"), addOrUpdateResume);

export default router;
