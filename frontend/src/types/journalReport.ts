import type { Child } from "./child";
import type { JournalEntry } from "./journal";

export interface JournalReportOptions {
  child: Child;
  entries: JournalEntry[];
  from?: string;
  to?: string;
  tagLabel?: string;
  parentName?: string;
  generatedAt?: Date;
}
