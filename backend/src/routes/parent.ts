import { Router } from "express";
import * as parentController from "../controllers/parent.js";

const router = Router();

router.get("/:id", parentController.getParent);
router.post("/", parentController.createParent);
router.put("/:id", parentController.updateParent);
router.delete("/:id", parentController.deleteParent);
router.post("/:id/children", parentController.linkChild);
router.delete("/:id/children/:childId", parentController.unlinkChild);

export default router;
