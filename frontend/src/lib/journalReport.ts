import { createElement, type ReactElement } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import JournalReportDocument from "./journalReportDocument";
import type { JournalReportOptions } from "@/types/journalReport";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildFilename({
  child,
  from,
  to,
}: Pick<JournalReportOptions, "child" | "from" | "to">): string {
  const childPart = slugify(child.name) || "be";
  const rangePart =
    from && to
      ? `${from}_${to}`
      : from
        ? `tu-${from}`
        : to
          ? `den-${to}`
          : "tat-ca";
  return `bao-cao-nhat-ky-abc_${childPart}_${rangePart}.pdf`;
}

export async function downloadJournalReport(
  options: JournalReportOptions,
): Promise<void> {
  const reportElement = createElement(
    JournalReportDocument,
    options,
  ) as ReactElement<DocumentProps>;
  const blob = await pdf(reportElement).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildFilename(options);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
