import { View, Text, StyleSheet } from "react-native";

type TaskDetail = {
  request_no: string;
  service: string;
  project: string;
};

export default function TaskHeader({
  task,
  statusText,
}: {
  task: TaskDetail | null;
  statusText: string;
}) {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.requestNo}>{task?.request_no || "REQUEST"}</Text>
      <Text style={styles.title}>{task?.project || "Project Details"}</Text>
      <Text style={styles.sub}>
        {task?.service || "Service not available"}
      </Text>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#111",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1C1C1C",
    marginBottom: 24,
  },
  requestNo: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },
  sub: {
    color: "#888",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "600",
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#D4AF37",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "900",
  },
});