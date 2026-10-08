export interface JournalEntry {
  _id: string;
  childId: string;
  date: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalInput {
  childId: string;
  date: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  notes: string;
}
