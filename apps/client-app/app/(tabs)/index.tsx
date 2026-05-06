import { ScrollView, Text, View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { router } from "expo-router";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  FadeInDown,
  FadeInRight,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function CountUp({ value }: { value: number }) {
  const count = useSharedValue(0);

  useEffect(() => {
    count.value = withTiming(value, { duration: 1500 });
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${Math.round(count.value)}`,
  }) as any);

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      style={styles.statNo}
      animatedProps={animatedProps}
      defaultValue="0"
    />
  );
}

export default function HomeScreen() {
  const { requests, client } = useAppContext();

  const total = requests.length;

  const completed = requests.filter(
    (r) =>
      r.status === "COMPLETED" ||
      r.status === "FINAL_REPORT_SHARED" ||
      r.status === "Completed"
  ).length;

  const pending = Math.max(total - completed, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 160 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>A CUBE B</Text>
          <Text style={styles.subtitle}>Smart Lab & Structural Consultancy</Text>
        </View>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Text style={styles.profileInitial}>
            {client?.name?.charAt(0)?.toUpperCase() || "C"}
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View entering={FadeInDown.duration(600)} style={styles.hero}>
        <Text style={styles.welcome}>WELCOME BACK</Text>
        <Text style={styles.name}>{client?.name || "Premium Client"}</Text>

        <View style={styles.tagRow}>
          <Text style={styles.tag}>NABL TESTING</Text>
          <View style={styles.tagDot} />
          <Text style={styles.tag}>STRUCTURAL CONSULTANCY</Text>
        </View>
      </Animated.View>

      <View style={styles.statsRow}>
        <Animated.View entering={FadeInRight.delay(100)} style={styles.statCard}>
          <CountUp value={total} />
          <Text style={styles.statText}>Requests</Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(200)} style={styles.statCard}>
          <CountUp value={completed} />
          <Text style={styles.statText}>Reports Ready</Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(300)} style={styles.statCard}>
          <CountUp value={pending} />
          <Text style={styles.statText}>In Progress</Text>
        </Animated.View>
      </View>

      <Text style={styles.section}>Quick Actions</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.actionCard, styles.goldCard]}
          onPress={() => router.push("/(tabs)/services")}
        >
          <Text style={styles.goldCardTitle}>New Request</Text>
          <Text style={styles.goldCardSub}>Initiate audit or lab test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/requests")}
        >
          <Text style={styles.cardTitle}>Track Live</Text>
          <Text style={styles.cardSub}>Real-time status tracking</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.section}>Recent Activity</Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/requests")}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {requests.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Requests</Text>
          <Text style={styles.empty}>
            Start your first service request and track it live from submission to final report.
          </Text>
        </Animated.View>
      ) : (
        requests.slice(0, 3).map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(400 + index * 100)}>
            <TouchableOpacity
              style={styles.requestCard}
              onPress={() => router.push(`/request-detail?id=${item.id}`)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.gold}>{item.requestNo}</Text>
                <View style={styles.dotSeparator} />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <Text style={styles.title}>{item.service}</Text>
              <Text style={styles.projectText}>{item.project}</Text>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {String(item.status || "NEW_REQUEST").replaceAll("_", " ")}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}

function getStatusColor(status: string) {
  const value = String(status || "");

  if (
    value.includes("COMPLETED") ||
    value.includes("SHARED") ||
    value.includes("APPROVED")
  ) {
    return "#4CAF50";
  }

  if (value.includes("PROGRESS") || value.includes("TESTING")) {
    return "#FF9800";
  }

  if (value.includes("ASSIGNED") || value.includes("COLLECTED")) {
    return "#42A5F5";
  }

  return "#D4AF37";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    padding: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },

  logo: {
    color: "#D4AF37",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },

  subtitle: {
    color: "#777",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  profileBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A1A1A",
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  profileInitial: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 16,
  },

  hero: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },

  welcome: {
    color: "#777",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },

  name: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },

  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },

  tag: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "800",
  },

  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
    marginHorizontal: 8,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#111",
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },

  statNo: {
    color: "#D4AF37",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    padding: 0,
  },

  statText: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  actionCard: {
    backgroundColor: "#111",
    width: "48%",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },

  goldCard: {
    backgroundColor: "#D4AF37",
  },

  goldCardTitle: {
    color: "#000",
    fontWeight: "900",
    fontSize: 16,
  },

  goldCardSub: {
    color: "#333",
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
  },

  cardTitle: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 16,
  },

  cardSub: {
    color: "#777",
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  section: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },

  viewAll: {
    color: "#D4AF37",
    fontWeight: "700",
    fontSize: 12,
  },

  requestCard: {
    backgroundColor: "#111",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#444",
    marginHorizontal: 10,
  },

  dateText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },

  gold: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 12,
  },

  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },

  projectText: {
    color: "#888",
    marginTop: 4,
    fontSize: 14,
    fontWeight: "500",
  },

  statusRow: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
  },

  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  emptyContainer: {
    padding: 28,
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 22,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#333",
  },

  emptyTitle: {
    color: "#D4AF37",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 8,
  },

  empty: {
    color: "#777",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
});