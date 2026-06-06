import { View, Text, StyleSheet } from "react-native";

type HistoryItem = {
  id: string;
  request_id: string;
  status: string;
  updated_by?: string;
  remarks?: string;
  created_at?: string;
};

export default function TimelineTab({
  history,
  formatDate,
}: {
  history: HistoryItem[];
  formatDate: (value?: string) => string;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>STATUS TIMELINE</Text>

      <View style={styles.timelineCard}>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No timeline records found.</Text>
        ) : (
          history.map((item, index) => (
            <View
              key={item.id || `${item.status}-${index}`}
              style={styles.timelineItem}
            >
              <View style={styles.timelineDot} />

              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>
                  {item.status.replaceAll("_", " ")}
                </Text>

                <Text style={styles.timelineRemarks}>
                  {item.remarks || "No remarks"}
                </Text>

                <Text style={styles.timelineMeta}>
                  {item.updated_by || "System"} • {formatDate(item.created_at)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  timelineCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1C1C1C",
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D4AF37",
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
  },
  timelineRemarks: {
    color: "#AAA",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  timelineMeta: {
    color: "#555",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "700",
  },
  emptyText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
  },
});