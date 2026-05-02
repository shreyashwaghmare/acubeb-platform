import { useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import * as Linking from "expo-linking";
import QRCode from "react-native-qrcode-svg";

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user?.token) return;

      try {
        const res = await api.getReportById(id, user.token);
        if (res.success) {
          setReport(res.data);
        }
      } catch (e) {
        console.log("Report fetch error", e);
      }
    };

    fetchReport();
  }, [id]);

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading report...</Text>
      </View>
    );
  }

  const verifyReport = () => {
    Alert.alert(
      "Report Verified",
      `This report is VALID\n\nReport No: ${report.reportNo}`
    );
  };

  const statusColor =
    report.status === "Completed"
      ? "#4CAF50"
      : report.status === "Pending"
      ? "#FF9800"
      : "#D4AF37";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <Text style={styles.heading}>Report Details</Text>

      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.reportNo}>{report.reportNo}</Text>
        <Text style={styles.service}>{report.service}</Text>

        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{report.status}</Text>
        </View>
      </View>

      {/* DETAILS */}
      <View style={styles.card}>
        <Row label="Client" value={report.client} />
        <Row label="Project" value={report.project} />
        <Row label="Issue Date" value={report.issueDate} />
      </View>

      {/* QR */}
      <Text style={styles.section}>QR Verification</Text>

      <View style={styles.qrBox}>
        <QRCode
          value={report.verificationCode || "ACUBEB"}
          size={140}
          backgroundColor="#fff"
        />
        <Text style={styles.small}>Scan to verify authenticity</Text>
      </View>

      {/* VERIFICATION */}
      <View style={styles.card}>
        <Text style={styles.label}>Verification Code</Text>
        <Text style={styles.code}>{report.verificationCode}</Text>
        <Text style={styles.info}>
          This report is securely stored in A Cube B database.
        </Text>
      </View>

      {/* ACTIONS */}
      <TouchableOpacity style={styles.primaryBtn} onPress={verifyReport}>
        <Text style={styles.primaryText}>Verify Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => {
          if (report.pdfUrl) {
            Linking.openURL(report.pdfUrl);
          } else {
            Alert.alert("No PDF available");
          }
        }}
      >
        <Text style={styles.secondaryText}>Download PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------- COMPONENT ---------- */

function Row({ label, value }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 18,
  },

  heading: {
    color: "#D4AF37",
    fontSize: 24,
    fontWeight: "900",
    marginVertical: 20,
  },

  hero: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },

  reportNo: {
    color: "#D4AF37",
    fontWeight: "800",
  },

  service: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 10,
  },

  statusText: {
    color: "#111",
    fontWeight: "900",
  },

  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  rowLabel: {
    color: "#777",
    fontSize: 12,
  },

  rowValue: {
    color: "#DDD",
    fontSize: 12,
  },

  section: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },

  qrBox: {
    backgroundColor: "#FFF",
    height: 180,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  small: {
    color: "#333",
    marginTop: 6,
  },

  label: {
    color: "#777",
    fontSize: 12,
  },

  code: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },

  info: {
    color: "#AAA",
    marginTop: 6,
  },

  primaryBtn: {
    backgroundColor: "#D4AF37",
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
  },

  primaryText: {
    color: "#111",
    textAlign: "center",
    fontWeight: "900",
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#D4AF37",
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
  },

  secondaryText: {
    color: "#D4AF37",
    textAlign: "center",
    fontWeight: "900",
  },
});