import { Router } from "express";
import {
  emailVerification,
  registerUser,
  resendVerificationOtp,
  userLogin,
  userLogout,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/verify-email").post(emailVerification);
router.route("/resend-otp").post(resendVerificationOtp);
router.route("/login").post(userLogin);
router.route("/logout").post(verifyJWT, userLogout);

export default router;
