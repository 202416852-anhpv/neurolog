import { Router } from "express";
import * as journalController from "../controllers/journal.js";

const router = Router();

router.get("/", journalController.getJournals);
router.post("/", journalController.createJournal);
router.delete("/:id", journalController.deleteJournal);

export default router;
