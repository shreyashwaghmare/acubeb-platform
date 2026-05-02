import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { api } from "../services/api";
import { router } from "expo-router";

export default function RequestDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { requests ,refreshRequests} = useAppContext();

  const request = requests.find((item) => item.id === String(id));
  const [timeline, setTimeline] = useState<any[]>([]);
  
  useEffect(() => {
  refreshRequests();
    }, [id]);
  useEffect(() => {
    if (!user?.token || !id) return;

    api.getRequestHistory(user.token, String(id)).then((res) => {
     
      if (res.success) setTimeline(res.data || []);
    });
  }, [id]);

  if (!request) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Request not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.heading}>Request Details</Text>

      <View style={styles.heroCard}>
        <Text style={styles.requestNo}>{request.requestNo}</Text>
        <Text style={styles.service}>{request.service}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>
  {formatStatus(request.status)}
</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Project Information</Text>

        <Text style={styles.label}>Project</Text>
        <Text style={styles.value}>{request.project}</Text>

        <Text style={styles.label}>Site Address</Text>
        <Text style={styles.value}>{request.site}</Text>

        <Text style={styles.label}>Request Date</Text>
        <Text style={styles.value}>{request.date}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Progress</Text>
        <Text style={styles.value}>
          Your request has been received by A Cube B team. Further updates will appear here after admin/operator action.
        </Text>
      </View>

      <Text style={styles.timelineHeading}>Status Timeline</Text>

      <View style={styles.timelineCard}>
  {(timeline.length > 0
    ? timeline
    : [
        {
          status: request.status || "NEW_REQUEST",
          updated_by: "system",
          created_at: request.date,
          remarks: "Request created and waiting for admin review.",
        },
      ]
  ).map((item, index) => (
    <View key={index} style={styles.row}>
      <View style={styles.left}>
        <View style={styles.dot} />
        {index !== (timeline.length > 0 ? timeline.length : 1) - 1 && <View style={styles.line} />}
      </View>

      <View style={styles.right}>
        <Text style={styles.timelineStatus}>{formatStatus(item.status)}</Text>
        <Text style={styles.meta}>
          Updated by {item.updated_by} • {String(item.created_at).split("T")[0]}
        </Text>
        {item.remarks ? <Text style={styles.remarks}>{item.remarks}</Text> : null}
      </View>
    </View>
  ))}
</View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Next Step</Text>
        <Text style={styles.value}>{getNextStep(request.status)}</Text>
      </View>

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

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
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
    default:
      return "A Cube B team will update the next progress shortly.";
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },

  heading: {
    color: "#D4AF37",
    fontSize: 24,
    fontWeight: "900",
    marginVertical: 20,
  },

  heroCard: {
    backgroundColor: "#1B1B1B",
    padding: 20,
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  requestNo: { color: "#D4AF37", fontWeight: "900" },
  service: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 8 },

  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: "#223322",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 14,
  },

  statusPillText: { color: "#90EE90", fontWeight: "900" },

  card: {
    backgroundColor: "#1B1B1B",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },

  label: { color: "#777", marginTop: 10 },
  value: { color: "#FFF", fontSize: 15, fontWeight: "700", marginTop: 4 },
  gold: { color: "#D4AF37", fontWeight: "800", marginTop: 6 },

  timelineHeading: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "900",
    marginVertical: 10,
  },

  timelineCard: {
    backgroundColor: "#1B1B1B",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },

  empty: { color: "#888", textAlign: "center", marginVertical: 20 },

  row: { flexDirection: "row", marginBottom: 20 },
  left: { width: 30, alignItems: "center" },
  dot: { width: 13, height: 13, borderRadius: 7, backgroundColor: "#D4AF37" },
  line: { width: 2, flex: 1, backgroundColor: "#444", marginTop: 2 },

  right: { flex: 1, paddingLeft: 10 },
  timelineStatus: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  meta: { color: "#888", fontSize: 12, marginTop: 3 },
  remarks: { color: "#AAA", marginTop: 5 },
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