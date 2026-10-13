import { Router } from "express";
import * as childController from "../controllers/child.js";

const router = Router();

router.get("/", childController.getChildren);
router.post("/", childController.createChild);
router.get("/:id", childController.getChild);
router.put("/:id", childController.updateChild);
router.delete("/:id", childController.deleteChild);

export default router;
