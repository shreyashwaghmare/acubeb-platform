import { ScrollView, Text, View, StyleSheet,TouchableOpacity } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { router } from "expo-router";

export default function HomeScreen() {
  const { requests,client } = useAppContext();
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.logo}>A CUBE B</Text>
      <Text style={styles.subtitle}>Smart Lab & Structural Consultancy</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Welcome, {client.name || "Client"}</Text>
        <Text style={styles.heroText}>Track services, samples, reports and approvals in one place.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNo}>12</Text>
          <Text style={styles.statText}>Requests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNo}>8</Text>
          <Text style={styles.statText}>Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNo}>2</Text>
          <Text style={styles.statText}>Pending</Text>
        </View>
      </View>

      <Text style={styles.section}>Recent Requests</Text>

      {requests.map((item) => (
  <TouchableOpacity
    key={item.id}
    style={styles.card}
    onPress={() => router.push(`/request-detail?id=${item.id}`)}
  >
    <Text style={styles.gold}>{item.requestNo}</Text>
    <Text style={styles.title}>{item.service}</Text>
    <Text style={styles.text}>{item.project}</Text>
    <Text style={styles.status}>{item.status}</Text>
  </TouchableOpacity>
))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },
  logo: { color: "#D4AF37", fontSize: 30, fontWeight: "900", marginTop: 20 },
  subtitle: { color: "#BBB", marginBottom: 20 },
  heroCard: { backgroundColor: "#1B1B1B", padding: 20, borderRadius: 22, marginBottom: 18 },
  heroTitle: { color: "#FFF", fontSize: 22, fontWeight: "800" },
  heroText: { color: "#AAA", marginTop: 8 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  statCard: { flex: 1, backgroundColor: "#1B1B1B", padding: 14, borderRadius: 16 },
  statNo: { color: "#D4AF37", fontSize: 22, fontWeight: "900" },
  statText: { color: "#AAA", fontSize: 12 },
  section: { color: "#D4AF37", fontSize: 18, fontWeight: "800", marginBottom: 12 },
  card: { backgroundColor: "#1B1B1B", padding: 16, borderRadius: 16, marginBottom: 12 },
  gold: { color: "#D4AF37", fontWeight: "800" },
  title: { color: "#FFF", fontSize: 17, fontWeight: "800", marginTop: 6 },
  text: { color: "#AAA", marginTop: 4 },
  status: { color: "#90EE90", marginTop: 8, fontWeight: "800" },
});