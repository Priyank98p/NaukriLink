import { Router } from "express";
import {
  emailVerification,
  registerUser,
  resendVerificationOtp,
  userLogin,
  forgotPassword,
  resetPassword,
  userLogout,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/register/verify-email").post(emailVerification);
router.route("/resend-otp").post(resendVerificationOtp);
router.route("/login").post(userLogin);
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password/:token").post(resetPassword)
router.route("/logout").post(verifyJWT, userLogout);

export default router;
