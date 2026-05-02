import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { router } from "expo-router";

export default function HomeScreen() {
  const { requests, client } = useAppContext();

  const total = requests.length;
  const pending = requests.filter(r => r.status !== "Completed").length;
  const completed = requests.filter(r => r.status === "Completed").length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      
      <Text style={styles.logo}>A CUBE B</Text>
      <Text style={styles.subtitle}>Smart Lab & Structural Consultancy</Text>

      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.welcome}>WELCOME</Text>
        <Text style={styles.name}>{client?.name || "Client"}</Text>
        <Text style={styles.sub}>
          Structural Audit • NABL Testing • Consultancy
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNo}>{total}</Text>
          <Text style={styles.statText}>Requests</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNo}>{completed}</Text>
          <Text style={styles.statText}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNo}>{pending}</Text>
          <Text style={styles.statText}>Pending</Text>
        </View>
      </View>

      {/* ACTION CARDS */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/services")}
        >
          <Text style={styles.cardTitle}>Apply Service</Text>
          <Text style={styles.cardSub}>Submit new request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/requests")}
        >
          <Text style={styles.cardTitle}>Track Requests</Text>
          <Text style={styles.cardSub}>Live status updates</Text>
        </TouchableOpacity>
      </View>

      {/* RECENT REQUESTS */}
      <Text style={styles.section}>Recent Requests</Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>
          No requests yet. Start by applying a service.
        </Text>
      ) : (
        requests.slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.requestCard}
            onPress={() => router.push(`/request-detail?id=${item.id}`)}
          >
            <Text style={styles.gold}>{item.requestNo}</Text>
            <Text style={styles.title}>{item.service}</Text>
            <Text style={styles.text}>{item.project}</Text>

            <View style={styles.statusRow}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.badge}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },

  logo: { color: "#D4AF37", fontSize: 30, fontWeight: "900", marginTop: 20 },
  subtitle: { color: "#BBB", marginBottom: 20 },

  hero: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
  },

  welcome: { color: "#777", fontSize: 12, letterSpacing: 2 },
  name: { color: "#D4AF37", fontSize: 26, fontWeight: "900", marginTop: 6 },
  sub: { color: "#AAA", marginTop: 6 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },

  statCard: {
    flex: 1,
    backgroundColor: "#1B1B1B",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  statNo: { color: "#D4AF37", fontSize: 22, fontWeight: "900" },
  statText: { color: "#AAA", fontSize: 12 },

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  actionCard: {
    backgroundColor: "#1B1B1B",
    width: "48%",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  cardTitle: { color: "#D4AF37", fontWeight: "800", fontSize: 16 },
  cardSub: { color: "#888", marginTop: 6 },

  section: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  requestCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  gold: { color: "#D4AF37", fontWeight: "800" },
  title: { color: "#FFF", fontSize: 17, fontWeight: "800", marginTop: 6 },
  text: { color: "#AAA", marginTop: 4 },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },

  date: { color: "#777", fontSize: 12 },

  badge: {
    backgroundColor: "#D4AF37",
    color: "#111",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: "800",
  },

  empty: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },
});