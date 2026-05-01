import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { reports } from "../data/mockData";

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();

  const report = reports.find((item) => item.id === id);

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Report not found</Text>
      </View>
    );
  }

  const verifyReport = () => {
    Alert.alert(
      "Report Verified",
      `This report is VALID.\n\nReport No: ${report.reportNo}\nProject: ${report.project}\nVerified by: ${report.verifiedBy}`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Report Details</Text>

      <View style={styles.card}>
        <Text style={styles.gold}>{report.reportNo}</Text>
        <Text style={styles.title}>{report.service}</Text>
        <Text style={styles.text}>Client: {report.client}</Text>
        <Text style={styles.text}>Project: {report.project}</Text>
        <Text style={styles.text}>Issue Date: {report.issueDate}</Text>
        <Text style={styles.status}>Status: {report.status}</Text>
      </View>

      <Text style={styles.section}>QR Verification</Text>

      <View style={styles.qrBox}>
        <Text style={styles.qrText}>QR</Text>
        <Text style={styles.small}>Scan to Verify Authenticity</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.text}>Verification Code:</Text>
        <Text style={styles.gold}>{report.verificationCode}</Text>
        <Text style={styles.text}>This confirms the report exists in A Cube B secure database.</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={verifyReport}>
        <Text style={styles.buttonText}>Verify Report</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.outlineButton}>
        <Text style={styles.outlineText}>Download PDF Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },
  heading: { color: "#D4AF37", fontSize: 24, fontWeight: "900", marginVertical: 20 },
  section: { color: "#D4AF37", fontSize: 18, fontWeight: "900", marginTop: 10, marginBottom: 10 },
  card: { backgroundColor: "#1B1B1B", padding: 18, borderRadius: 16, marginBottom: 14 },
  gold: { color: "#D4AF37", fontWeight: "900", marginTop: 6 },
  title: { color: "#FFF", fontSize: 19, fontWeight: "900", marginTop: 6 },
  text: { color: "#AAA", marginTop: 6 },
  status: { color: "#90EE90", marginTop: 10, fontWeight: "900" },
  qrBox: {
    backgroundColor: "#FFF",
    height: 180,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  qrText: { color: "#111", fontSize: 48, fontWeight: "900" },
  small: { color: "#333", marginTop: 6, fontWeight: "700" },
  button: { backgroundColor: "#D4AF37", padding: 15, borderRadius: 14, marginTop: 6 },
  buttonText: { color: "#111", textAlign: "center", fontWeight: "900", fontSize: 16 },
  outlineButton: { borderColor: "#D4AF37", borderWidth: 1, padding: 15, borderRadius: 14, marginTop: 12 },
  outlineText: { color: "#D4AF37", textAlign: "center", fontWeight: "900" },
});