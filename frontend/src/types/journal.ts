export type JournalTag = "poor" | "fair" | "good" | "great";

export const JOURNAL_TAGS: JournalTag[] = ["poor", "fair", "good", "great"];

export interface JournalTagMeta {
  value: JournalTag;
  label: string;
  emoji: string;
  optionClass: string;
  dotClass: string;
  accentClass: string;
  tintClass: string;
}

export const JOURNAL_TAG_META: Record<JournalTag, JournalTagMeta> = {
  poor: {
    value: "poor",
    label: "Tệ",
    emoji: "😞",
    optionClass:
      "border-brand-coral bg-brand-coral/15 text-[#3d6690] dark:text-[#8fb0d9]",
    dotClass: "bg-brand-coral",
    accentClass: "border-l-brand-coral",
    tintClass: "bg-brand-coral/[0.04]",
  },
  fair: {
    value: "fair",
    label: "Bình thường",
    emoji: "😐",
    optionClass:
      "border-brand-yellow bg-brand-yellow/20 text-[#7a5c2b] dark:text-brand-yellow",
    dotClass: "bg-brand-yellow",
    accentClass: "border-l-brand-yellow",
    tintClass: "bg-brand-yellow/[0.05]",
  },
  good: {
    value: "good",
    label: "Ổn",
    emoji: "🙂",
    optionClass:
      "border-brand-mint bg-brand-mint/15 text-[#3a6d84] dark:text-brand-mint",
    dotClass: "bg-brand-mint",
    accentClass: "border-l-brand-mint",
    tintClass: "bg-brand-mint/[0.05]",
  },
  great: {
    value: "great",
    label: "Tốt",
    emoji: "😄",
    optionClass:
      "border-brand-green bg-brand-green/15 text-brand-green",
    dotClass: "bg-brand-green",
    accentClass: "border-l-brand-green",
    tintClass: "bg-brand-green/[0.05]",
  },
};

export const UNRATED_DOT_CLASS = "bg-muted-foreground/40";

export const UNRATED_ACCENT_CLASS = "border-l-muted-foreground/40";

export interface JournalEntry {
  _id: string;
  childId: string;
  date: string;
  antecedent: string;
  behavior: string;
  consequence: string;
  notes: string;
  tag?: JournalTag;
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
  tag: JournalTag;
}

export interface JournalQuery {
  childId?: string;
  tag?: JournalTag;
  from?: string;
  to?: string;
}
