import { Router } from "express";
import * as authController from "../controllers/auth.js";

const router = Router();

router.post("/google", authController.login);
router.post("/complete", authController.completeProfile);
router.get("/me", authController.me);

export default router;
