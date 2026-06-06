import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { usePremiumToast } from "../components/PremiumToast";
import { api } from "../services/api";
import { pickAndUploadReport } from "../services/reportUpload";

export default function ReportUploadScreen() {
  const { id } = useLocalSearchParams();
  const requestId = String(id);

  const { user } = useAuth();
  const { showToast } = usePremiumToast();

  const [pdfUrl, setPdfUrl] = useState("");
  const [remarks, setRemarks] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectPdf = async () => {
    try {
      setUploadingPdf(true);

      const url = await pickAndUploadReport();

      if (url) {
        setPdfUrl(url);
        showToast("PDF uploaded successfully", "success");
      }
    } catch (error: any) {
      console.error(error);
      showToast(error?.message || "PDF upload failed", "error");
    } finally {
      setUploadingPdf(false);
    }
  };

  const submitReport = async () => {
    if (!user?.token) {
      showToast("Session expired", "error");
      return;
    }

    if (!pdfUrl) {
      showToast("Please upload PDF first", "error");
      return;
    }

    try {
      setSubmitting(true);

      const reportNo = `ACB-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

      const res = await api.createReport(user.token, requestId, reportNo, pdfUrl);

      if (res.success) {
        showToast("Report sent for approval", "success");
        router.back();
      } else {
        showToast(res.message || "Report creation failed", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Report creation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#D4AF37" />
        <Text style={styles.backText}>Back to Task</Text>
      </TouchableOpacity>

      <Text style={styles.meta}>REPORT MANAGEMENT</Text>
      <Text style={styles.title}>Upload Report</Text>
      <Text style={styles.sub}>
        Select final PDF report and send it for admin approval.
      </Text>

      <View style={styles.card}>
        <Ionicons name="document-text-outline" size={42} color="#D4AF37" />

        <Text style={styles.cardTitle}>Report Ready For Submission</Text>

        <Text style={styles.cardSub}>
          Upload the final PDF report before sending it to admin.
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, uploadingPdf && { opacity: 0.45 }]}
          onPress={selectPdf}
          disabled={uploadingPdf || submitting}
        >
          {uploadingPdf ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="#000" />
              <Text style={styles.primaryText}>
                {pdfUrl ? "PDF UPLOADED" : "SELECT PDF REPORT"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {pdfUrl ? (
          <Text style={styles.uploadSuccess}>PDF selected and uploaded.</Text>
        ) : null}
      </View>

      <Text style={styles.label}>REMARKS OPTIONAL</Text>
      <TextInput
        style={styles.textArea}
        multiline
        placeholder="Any report note for admin..."
        placeholderTextColor="#444"
        value={remarks}
        onChangeText={setRemarks}
      />

      <TouchableOpacity
        style={[
          styles.submitBtn,
          (submitting || uploadingPdf || !pdfUrl) && { opacity: 0.45 },
        ]}
        onPress={submitReport}
        disabled={submitting || uploadingPdf || !pdfUrl}
      >
        {submitting ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Ionicons name="send-outline" size={18} color="#000" />
            <Text style={styles.submitText}>SEND FOR APPROVAL</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    padding: 22,
    paddingTop: 60,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 26,
  },
  backText: {
    color: "#D4AF37",
    fontWeight: "800",
    fontSize: 14,
  },
  meta: {
    color: "#555",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 6,
  },
  sub: {
    color: "#777",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1C1C1C",
    alignItems: "center",
    marginBottom: 22,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
  },
  cardSub: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: "#D4AF37",
    height: 50,
    borderRadius: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
  },
  uploadSuccess: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
  },
  label: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1C1C1C",
    borderRadius: 14,
    color: "#FFF",
    padding: 14,
    height: 110,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: "#D4AF37",
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
  },
});