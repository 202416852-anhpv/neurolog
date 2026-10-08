import { Router } from "express";
import * as taskController from "../controllers/task.js";

const router = Router();

router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.post("/:id/submit", taskController.submitTask);
router.post("/:id/approve", taskController.approveTask);

export default router;
