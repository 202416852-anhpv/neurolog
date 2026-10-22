import type { ReactElement } from "react";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  type DocumentProps,
} from "@react-pdf/renderer";
import boldFont from "@/assets/fonts/NotoSans-Bold.ttf?url";
import regularFont from "@/assets/fonts/NotoSans-Regular.ttf?url";
import {
  JOURNAL_TAGS,
  JOURNAL_TAG_META,
  type JournalEntry,
  type JournalTag,
} from "@/types/journal";
import type { Child } from "@/types/child";
import type { JournalReportOptions } from "@/types/journalReport";

Font.register({
  family: "NotoSans",
  fonts: [
    { src: regularFont, fontWeight: 400 },
    { src: boldFont, fontWeight: 700 },
  ],
});

const COLORS = {
  ink: "#0b1c30",
  muted: "#5b6475",
  line: "#dbe1ee",
  primary: "#004ac6",
  primarySoft: "#eff4ff",
  white: "#ffffff",
  yellow: "#f5b400",
  coral: "#ff7a45",
  green: "#006a61",
} as const;

const TAG_COLORS: Record<
  JournalTag,
  { text: string; background: string }
> = {
  poor: { text: "#b5471f", background: "#fff1eb" },
  fair: { text: "#8a6200", background: "#fff8e1" },
  good: { text: "#006f69", background: "#e7f7f5" },
  great: { text: "#006a61", background: "#e8f5ed" },
};

const UNRATED_COLORS = {
  text: "#64748b",
  background: "#f1f5f9",
};

const GENDER_LABEL: Record<NonNullable<Child["gender"]>, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    color: COLORS.ink,
    fontFamily: "NotoSans",
    fontSize: 9,
    lineHeight: 1.45,
    paddingTop: 58,
    paddingBottom: 52,
    paddingHorizontal: 40,
  },
  topBar: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  topBarRule: {
    position: "absolute",
    top: 48,
    left: 40,
    right: 40,
    height: 1,
    backgroundColor: COLORS.line,
  },
  brand: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  topBarMeta: {
    fontSize: 8,
    color: COLORS.muted,
  },
  header: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 9,
    color: COLORS.muted,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  infoItem: {
    width: "50%",
    paddingVertical: 3,
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 9.5,
    fontWeight: 700,
    color: COLORS.ink,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 0,
    borderRadius: 8,
    padding: 9,
    marginRight: 8,
    backgroundColor: "#f6f8fc",
  },
  summaryCardLast: {
    marginRight: 0,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.primary,
    lineHeight: 1.1,
  },
  summaryLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
    marginTop: 3,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginRight: 6,
    marginBottom: 5,
  },
  tagChipText: {
    fontSize: 7.5,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 2,
    marginBottom: 8,
    color: COLORS.ink,
  },
  entry: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingBottom: 6,
  },
  entryDivider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginBottom: 7,
  },
  entryDate: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.ink,
  },
  badge: {
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 7.5,
    fontWeight: 700,
  },
  abcBlock: {
    marginBottom: 7,
  },
  abcHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  abcBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  abcBadgeText: {
    fontSize: 7.5,
    fontWeight: 700,
    color: COLORS.ink,
  },
  abcLabel: {
    fontSize: 6.8,
    fontWeight: 700,
    color: COLORS.muted,
    letterSpacing: 0.3,
  },
  abcText: {
    fontSize: 8.8,
    lineHeight: 1.45,
    color: COLORS.ink,
  },
  notes: {
    marginTop: 2,
  },
  notesLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.muted,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 8.4,
    lineHeight: 1.4,
    color: COLORS.ink,
  },
  empty: {
    borderRadius: 8,
    backgroundColor: "#f6f8fc",
    padding: 16,
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 9,
  },
});

function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatGeneratedAt(value: Date): string {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

function sortEntries(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function getPeriodLabel(
  entries: JournalEntry[],
  from?: string,
  to?: string,
): string {
  if (from && to) return `${formatDate(from)} – ${formatDate(to)}`;
  if (from) return `Từ ${formatDate(from)}`;
  if (to) return `Đến ${formatDate(to)}`;
  if (entries.length === 0) return "Toàn bộ thời gian";
  return `${formatDate(entries[0].date)} – ${formatDate(entries[entries.length - 1].date)}`;
}

function getTagColors(tag?: JournalTag) {
  return tag ? TAG_COLORS[tag] : UNRATED_COLORS;
}

function getTagLabel(tag?: JournalTag): string {
  return tag ? JOURNAL_TAG_META[tag].label : "Chưa đánh giá";
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function AbcRow({
  letter,
  label,
  value,
  color,
}: {
  letter: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.abcBlock}>
      <View style={styles.abcHeader} wrap={false}>
        <View style={[styles.abcBadge, { backgroundColor: color }]}>
          <Text style={styles.abcBadgeText}>{letter}</Text>
        </View>
        <Text style={styles.abcLabel}>{label}</Text>
      </View>
      <Text style={styles.abcText}>{value}</Text>
    </View>
  );
}

export default function JournalReportDocument({
  child,
  entries,
  from,
  to,
  tagLabel,
  parentName,
  generatedAt = new Date(),
}: JournalReportOptions): ReactElement<DocumentProps> {
  const sortedEntries = sortEntries(entries);
  const periodLabel = getPeriodLabel(sortedEntries, from, to);
  const dayCount = new Set(sortedEntries.map((entry) => entry.date.slice(0, 10)))
    .size;
  const ratedCount = sortedEntries.filter((entry) => entry.tag).length;
  const generatedLabel = formatGeneratedAt(generatedAt);
  const genderLabel = child.gender
    ? GENDER_LABEL[child.gender]
    : "Chưa cập nhật";
  const birthDateLabel = child.dateOfBirth
    ? formatDate(child.dateOfBirth)
    : "Chưa cập nhật";
  const reportTitle = `Báo cáo nhật ký ABC - ${child.name}`;

  return (
    <Document
      title={reportTitle}
      subject="Báo cáo nhật ký ABC"
      author={parentName ?? "NeuroLog"}
      creator="NeuroLog"
      producer="NeuroLog"
      keywords="NeuroLog, nhật ký ABC, báo cáo"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.topBar} fixed>
          <Text style={styles.brand}>NeuroLog</Text>
          <Text style={styles.topBarMeta}>Báo cáo nhật ký ABC</Text>
        </View>
        <View style={styles.topBarRule} fixed />

        <View style={styles.header}>
          <Text style={styles.eyebrow}>BÁO CÁO NHẬT KÝ ABC</Text>
          <Text style={styles.title}>{child.name}</Text>
          <Text style={styles.subtitle}>
            Khoảng thời gian: {periodLabel} · Xuất ngày {generatedLabel}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <InfoItem label="Họ tên" value={child.name} />
          <InfoItem label="Tuổi" value={`${child.age}`} />
          <InfoItem label="Giới tính" value={genderLabel} />
          <InfoItem label="Ngày sinh" value={birthDateLabel} />
          <InfoItem label="Người lập" value={parentName ?? "Phụ huynh"} />
          <InfoItem label="Đánh giá" value={tagLabel ?? "Tất cả đánh giá"} />
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{sortedEntries.length}</Text>
            <Text style={styles.summaryLabel}>Bản ghi</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{dayCount}</Text>
            <Text style={styles.summaryLabel}>Ngày có ghi nhận</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardLast]}>
            <Text style={styles.summaryValue}>{ratedCount}</Text>
            <Text style={styles.summaryLabel}>Bản ghi đã đánh giá</Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          {JOURNAL_TAGS.map((tag) => {
            const colors = TAG_COLORS[tag];
            const count = sortedEntries.filter((entry) => entry.tag === tag).length;
            return (
              <View
                key={tag}
                style={[
                  styles.tagChip,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.tagChipText, { color: colors.text }]}>
                  {JOURNAL_TAG_META[tag].label}: {count}
                </Text>
              </View>
            );
          })}
          <View
            style={[
              styles.tagChip,
              { backgroundColor: UNRATED_COLORS.background },
            ]}
          >
            <Text style={[styles.tagChipText, { color: UNRATED_COLORS.text }]}>
              Chưa đánh giá:{" "}
              {sortedEntries.filter((entry) => !entry.tag).length}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Chi tiết nhật ký</Text>

        {sortedEntries.length === 0 ? (
          <Text style={styles.empty}>Không có bản ghi phù hợp.</Text>
        ) : (
          sortedEntries.map((entry) => {
            const colors = getTagColors(entry.tag);
            return (
              <View key={entry._id} style={styles.entry}>
                <View style={styles.entryHeader} wrap={false}>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                      {getTagLabel(entry.tag)}
                    </Text>
                  </View>
                </View>
                <View style={styles.entryDivider} />

                <AbcRow
                  letter="A"
                  label="Sự kiện dẫn dắt"
                  value={entry.antecedent}
                  color={COLORS.yellow}
                />
                <AbcRow
                  letter="B"
                  label="Hành vi"
                  value={entry.behavior}
                  color={COLORS.coral}
                />
                <AbcRow
                  letter="C"
                  label="Hậu quả"
                  value={entry.consequence}
                  color={COLORS.green}
                />

                {entry.notes ? (
                  <View style={styles.notes}>
                    <Text style={styles.notesLabel}>GHI CHÚ</Text>
                    <Text style={styles.notesText}>{entry.notes}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}

      </Page>
    </Document>
  );
}


