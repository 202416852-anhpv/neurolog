import { Router } from "express";
import * as chatController from "../controllers/chat.js";

const router = Router();

router.post("/", chatController.chat);
router.get("/greet", chatController.greet);

export default router;
