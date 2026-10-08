import type { Request, Response } from "express";
import * as journalService from "../services/journal.js";
import { createJournalSchema } from "../validations/journal.js";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import logger from "../logger/index.js";

export const getJournals = async (req: Request, res: Response) => {
  const childId =
    typeof req.query.childId === "string" ? req.query.childId : undefined;
  const entries = await journalService.getJournals(childId);
  logger.info({ count: entries.length }, "Fetched journal entries");
  res.json(entries);
};

export const createJournal = async (req: Request, res: Response) => {
  const parsed = createJournalSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const entry = await journalService.createJournal(parsed.data);
  logger.info({ id: entry._id }, "Journal entry created");
  res.status(201).json(entry);
};

export const deleteJournal = async (req: Request, res: Response) => {
  const entry = await journalService.deleteJournal(req.params.id as string);
  if (!entry) {
    throw new AppError(ERROR_MESSAGES.JOURNAL_NOT_FOUND, 404);
  }
  logger.info({ id: entry._id }, "Journal entry deleted");
  res.status(204).send();
};
