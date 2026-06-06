import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import InfoRow from "./InfoRow";

type TaskDetail = {
  client_name?: string;
  client_mobile?: string;
  site?: string;
  sample_qty?: string;
  contact_person?: string;
};

export default function ClientTab({
  task,
  hasCheckedIn,
  checkingIn,
  onCallClient,
  onOpenMaps,
  onStartSiteVisit,
}: {
  task: TaskDetail | null;
  hasCheckedIn: boolean;
  checkingIn: boolean;
  onCallClient: () => void;
  onOpenMaps: () => void;
  onStartSiteVisit: () => void;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>CLIENT DETAILS</Text>

      <View style={styles.infoCard}>
        <InfoRow
          icon="person-outline"
          label="Client"
          value={task?.client_name || "Client name pending"}
        />
        <InfoRow
          icon="call-outline"
          label="Mobile"
          value={task?.client_mobile || "Mobile not available"}
        />
        <InfoRow
          icon="location-outline"
          label="Site"
          value={task?.site || "Site address pending"}
        />
        <InfoRow
          icon="flask-outline"
          label="Samples"
          value={task?.sample_qty || "Sample qty pending"}
        />
        <InfoRow
          icon="person-circle-outline"
          label="Contact"
          value={task?.contact_person || "Contact pending"}
        />
      </View>

      <View style={styles.quickActionRow}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={onCallClient}>
          <Ionicons name="call-outline" size={18} color="#000" />
          <Text style={styles.quickActionText}>Call Client</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionBtn} onPress={onOpenMaps}>
          <Ionicons name="navigate-outline" size={18} color="#000" />
          <Text style={styles.quickActionText}>Open Maps</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.siteVisitBtn,
          hasCheckedIn && { backgroundColor: "#1E4620" },
        ]}
        onPress={onStartSiteVisit}
        disabled={checkingIn || hasCheckedIn}
      >
        <Ionicons
          name={hasCheckedIn ? "checkmark-circle-outline" : "location-outline"}
          size={18}
          color={hasCheckedIn ? "#FFF" : "#000"}
        />

        <Text style={[styles.siteVisitText, hasCheckedIn && { color: "#FFF" }]}>
          {checkingIn
            ? "Capturing GPS..."
            : hasCheckedIn
              ? "Site Visit Started"
              : "Start Site Visit"}
        </Text>
      </TouchableOpacity>
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
  infoCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1C1C1C",
    marginBottom: 20,
  },
  quickActionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  quickActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickActionText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
  },
  siteVisitBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#D4AF37",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  siteVisitText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "900",
  },
});