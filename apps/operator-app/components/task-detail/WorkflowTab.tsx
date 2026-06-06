import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

export default function WorkflowTab({
  remarks,
  setRemarks,
  updating,
  currentStatus,
  shouldShowReportUpload,
  requestId,
  onStatusChange,
}: {
  remarks: string;
  setRemarks: (value: string) => void;
  updating: boolean;
  currentStatus: string;
  shouldShowReportUpload: boolean;
  requestId: string;
  onStatusChange: (status: string) => void;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>FIELD REMARKS</Text>

      <TextInput
        style={styles.textArea}
        multiline
        placeholder="Type collection notes..."
        placeholderTextColor="#444"
        value={remarks}
        onChangeText={setRemarks}
        autoCorrect={false}
      />

      <Text style={styles.sectionLabel}>EXECUTE STATUS ACTION</Text>

      {updating ? (
        <ActivityIndicator
          size="large"
          color="#D4AF37"
          style={{ marginTop: 20 }}
        />
      ) : (
        <View style={styles.actionBlock}>
          {currentStatus === "TESTING_IN_PROGRESS" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#2E7D32" }]}
              onPress={() => onStatusChange("REPORT_READY")}
            >
              <Ionicons name="document-text-outline" size={18} color="#FFF" />
              <Text style={styles.btnText}>MARK REPORT READY</Text>
            </TouchableOpacity>
          )}

          {currentStatus === "OPERATOR_ASSIGNED" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#D4AF37" }]}
              onPress={() => onStatusChange("SAMPLE_COLLECTED")}
            >
              <Ionicons name="checkbox-outline" size={18} color="#000" />
              <Text style={[styles.btnText, { color: "#000" }]}>
                MARK SAMPLE COLLECTED
              </Text>
            </TouchableOpacity>
          )}

          {currentStatus === "SAMPLE_COLLECTED" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#1E4620" }]}
              onPress={() => onStatusChange("LAB_RECEIVED")}
            >
              <Ionicons name="beaker-outline" size={18} color="#FFF" />
              <Text style={styles.btnText}>MARK LAB RECEIVED</Text>
            </TouchableOpacity>
          )}

          {currentStatus === "LAB_RECEIVED" && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
              onPress={() => onStatusChange("TESTING_IN_PROGRESS")}
            >
              <Ionicons name="flask-outline" size={18} color="#FFF" />
              <Text style={styles.btnText}>START TESTING</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {shouldShowReportUpload && (
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() =>
            router.push({
              pathname: "/report-upload",
              params: { id: requestId },
            })
          }
        >
          <Ionicons name="document-attach-outline" size={18} color="#000" />
          <Text style={styles.reportBtnText}>OPEN REPORT UPLOAD</Text>
        </TouchableOpacity>
      )}
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
  textArea: {
    backgroundColor: "#111",
    color: "#FFF",
    padding: 16,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    height: 110,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  actionBlock: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  reportBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  reportBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
  },
});