import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { reports } from "../../data/mockData";
import { router } from "expo-router";

export default function ReportsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
      <Text style={styles.heading}>Report History</Text>

      {reports.map((item) => (
        <TouchableOpacity
  key={item.id}
  style={styles.card}
  onPress={() => router.push(`/report-detail?id=${item.id}`)}
>
          <Text style={styles.gold}>{item.reportNo}</Text>
          <Text style={styles.title}>{item.service}</Text>
          <Text style={styles.text}>Project: {item.project}</Text>
          <Text style={styles.text}>Date: {item.issueDate}</Text>
          <Text style={styles.status}>Status: {item.status}</Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Download Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineButton}>
            <Text style={styles.outlineText}>Verify QR Report</Text>
          </TouchableOpacity>
       </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },
  heading: { color: "#D4AF37", fontSize: 24, fontWeight: "900", marginVertical: 20 },
  card: { backgroundColor: "#1B1B1B", padding: 18, borderRadius: 16, marginBottom: 12 },
  gold: { color: "#D4AF37", fontWeight: "800" },
  title: { color: "#FFF", fontSize: 17, fontWeight: "800", marginTop: 6 },
  text: { color: "#AAA", marginTop: 5 },
  status: { color: "#90EE90", marginTop: 8, fontWeight: "800" },
  button: { backgroundColor: "#D4AF37", padding: 13, borderRadius: 12, marginTop: 16 },
  buttonText: { color: "#111", textAlign: "center", fontWeight: "900" },
  outlineButton: { borderColor: "#D4AF37", borderWidth: 1, padding: 13, borderRadius: 12, marginTop: 10 },
  outlineText: { color: "#D4AF37", textAlign: "center", fontWeight: "800" },
});