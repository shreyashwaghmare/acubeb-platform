import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { api } from "../services/api";

export default function RequestDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { requests, refreshRequests } = useAppContext();

  const request = requests.find((item) => item.id === String(id));
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
  const interval = setInterval(() => {
    refreshAll();
  }, 5000); // every 5 sec

  return () => clearInterval(interval);
}, [id, user?.token]);

  const fetchTimeline = async () => {
    if (!user?.token || !id) return;

    const res = await api.getRequestHistory(user.token, String(id));

    if (res.success) {
      setTimeline(res.data || []);
    }
  };

  const refreshAll = async () => {
    try {
      setLoadingHistory(true);
      await refreshRequests();
      await fetchTimeline();
    } catch (error) {
      console.log("Refresh all error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!request) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Request not found</Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)/requests")}
        >
          <Text style={styles.backButtonText}>Back to Requests</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayTimeline =
    timeline.length > 0
      ? timeline
      : [
          {
            status: request.status || "NEW_REQUEST",
            updated_by: "system",
            created_at: request.date,
            remarks: "Request created and waiting for admin review.",
          },
        ];

  const statusColor = getStatusColor(request.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.heading}>Request Details</Text>

      <View style={styles.heroCard}>
        <Text style={styles.requestNo}>{request.requestNo}</Text>
        <Text style={styles.service}>{request.service}</Text>

        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={styles.statusPillText}>{formatStatus(request.status)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Project Information</Text>
        <InfoRow label="Project" value={request.project} />
        <InfoRow label="Site Address" value={request.site} />
        <InfoRow label="Request Date" value={request.date} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Progress</Text>
        <Text style={styles.value}>{getProgressMessage(request.status)}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.timelineHeading}>Status Timeline</Text>

        <TouchableOpacity onPress={refreshAll}>
          <Text style={styles.refreshText}>
            {loadingHistory ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timelineCard}>
        {displayTimeline.map((item, index) => {
          const isLast = index === displayTimeline.length - 1;

          return (
            <View key={index} style={styles.row}>
              <View style={styles.left}>
                <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]} />
                {!isLast && <View style={styles.line} />}
              </View>

              <View style={styles.right}>
                <Text style={styles.timelineStatus}>{formatStatus(item.status)}</Text>
                <Text style={styles.meta}>
                  Updated by {item.updated_by || "system"} •{" "}
                  {String(item.created_at || request.date).split("T")[0]}
                </Text>

                {item.remarks ? <Text style={styles.remarks}>{item.remarks}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Next Step</Text>
        <Text style={styles.value}>{getNextStep(request.status)}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.reportButton,
          !isReportReady(request.status) && styles.disabledReportButton,
        ]}
        onPress={async () => {
          if (!isReportReady(request.status)) {
            alert("Report is not available yet.");
            return;
          }

          if (!user?.token) {
            alert("Session expired. Please login again.");
            return;
          }

          try {
            const res = await api.getReportByRequestId(request.id, user.token);

            if (res.success) {
              router.push(`/report-detail?id=${res.data.id}`);
            } else {
              alert("Report not available yet");
            }
          } catch (e) {
            console.log(e);
            alert("Something went wrong");
          }
        }}
      >
        <Text style={styles.reportButtonText}>
          {isReportReady(request.status) ? "View Final Report" : "Report Not Available Yet"}
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Text style={styles.value}>A Cube B Consultants Pvt Ltd</Text>
        <Text style={styles.gold}>9881967899</Text>
        <Text style={styles.gold}>acubebconsultant@gmail.com</Text>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/(tabs)/requests")}
      >
        <Text style={styles.backButtonText}>Back to Requests</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.infoValue}>{value || "N/A"}</Text>
    </View>
  );
}

function formatStatus(status: string) {
  return String(status || "NEW_REQUEST").replaceAll("_", " ");
}

function getStatusColor(status: string) {
  switch (status) {
    case "NEW_REQUEST":
    case "New Request":
      return "#D4AF37";
    case "OPERATOR_ASSIGNED":
      return "#42A5F5";
    case "SAMPLE_COLLECTED":
      return "#AB47BC";
    case "TESTING_IN_PROGRESS":
      return "#FF9800";
    case "REPORT_APPROVED":
    case "FINAL_REPORT_SHARED":
    case "COMPLETED":
      return "#4CAF50";
    default:
      return "#D4AF37";
  }
}

function getProgressMessage(status: string) {
  switch (status) {
    case "NEW_REQUEST":
    case "New Request":
      return "Your request has been received. Admin review is pending.";
    case "OPERATOR_ASSIGNED":
      return "An operator has been assigned for this request.";
    case "SAMPLE_COLLECTED":
      return "Sample collection is completed. Lab processing will begin shortly.";
    case "TESTING_IN_PROGRESS":
      return "Testing is in progress. Report preparation will start after testing.";
    case "REPORT_APPROVED":
      return "Report is approved and ready to be shared.";
    case "FINAL_REPORT_SHARED":
    case "COMPLETED":
      return "Final report has been shared. You can view it from Reports.";
    default:
      return "A Cube B team will update the next progress shortly.";
  }
}

function getNextStep(status: string) {
  switch (status) {
    case "NEW_REQUEST":
    case "New Request":
      return "Admin will review your request and assign an operator.";
    case "OPERATOR_ASSIGNED":
      return "Operator will contact you for sample collection / site visit.";
    case "SAMPLE_COLLECTED":
      return "Sample will be received at lab and testing will begin.";
    case "TESTING_IN_PROGRESS":
      return "Testing is in progress. Draft report will be prepared.";
    case "REPORT_APPROVED":
      return "Final report is approved and will be available in Reports section.";
    case "FINAL_REPORT_SHARED":
    case "COMPLETED":
      return "You can now download or verify your final report.";
    default:
      return "A Cube B team will update the next progress shortly.";
  }
}

function isReportReady(status: string) {
  return ["REPORT_APPROVED", "FINAL_REPORT_SHARED", "COMPLETED"].includes(status);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },
  heading: { color: "#D4AF37", fontSize: 24, fontWeight: "900", marginVertical: 20 },

  heroCard: {
    backgroundColor: "#1A1A1A",
    padding: 22,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  requestNo: { color: "#D4AF37", fontWeight: "900" },
  service: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 8 },

  statusPill: {
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 14,
  },

  statusPillText: { color: "#111", fontWeight: "900" },

  card: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  sectionTitle: { color: "#D4AF37", fontSize: 16, fontWeight: "900", marginBottom: 10 },
  infoRow: { marginTop: 10 },
  label: { color: "#777", fontSize: 12 },
  infoValue: { color: "#FFF", fontSize: 15, fontWeight: "700", marginTop: 4 },
  value: { color: "#FFF", fontSize: 15, fontWeight: "700", marginTop: 4 },
  gold: { color: "#D4AF37", fontWeight: "800", marginTop: 6 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  timelineHeading: { color: "#D4AF37", fontSize: 18, fontWeight: "900" },
  refreshText: { color: "#D4AF37", fontWeight: "800", fontSize: 12 },

  timelineCard: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  row: { flexDirection: "row", marginBottom: 20 },
  left: { width: 30, alignItems: "center" },
  dot: { width: 13, height: 13, borderRadius: 7 },
  line: { width: 2, flex: 1, backgroundColor: "#444", marginTop: 2 },

  right: { flex: 1, paddingLeft: 10 },
  timelineStatus: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  meta: { color: "#888", fontSize: 12, marginTop: 3 },
  remarks: { color: "#AAA", marginTop: 5 },

  reportButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 14,
    marginBottom: 14,
  },

  disabledReportButton: { backgroundColor: "#2A2A2A" },

  reportButtonText: {
    color: "#111",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  backButton: {
    backgroundColor: "#D4AF37",
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 30,
  },

  backButtonText: {
    color: "#111",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});