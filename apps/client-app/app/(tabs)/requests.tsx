import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAppContext } from "../../context/AppContext";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function RequestsScreen() {
  const { requests, refreshRequests } = useAppContext();

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
    }, [])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text style={styles.heading}>My Requests</Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>
          No requests yet. Start by applying a service.
        </Text>
      ) : (
        requests.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/request-detail?id=${item.id}`)}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.requestNo}>{item.requestNo}</Text>
              <Text style={styles.badge}>{item.status}</Text>
            </View>

            {/* SERVICE */}
            <Text style={styles.title}>{item.service}</Text>

            {/* DETAILS */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Project</Text>
              <Text style={styles.value}>{item.project}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Site</Text>
              <Text style={styles.value}>{item.site}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{item.date}</Text>
            </View>

            {/* TIMELINE */}
            <View style={styles.timeline}>
              {item.timeline.map((step, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.dot} />
                  <Text style={styles.step}>{step}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

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

  empty: {
    color: "#777",
    textAlign: "center",
    marginTop: 60,
  },

  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  requestNo: {
    color: "#D4AF37",
    fontWeight: "800",
  },

  badge: {
    backgroundColor: "#D4AF37",
    color: "#111",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: "800",
  },

  title: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  label: {
    color: "#777",
    fontSize: 12,
  },

  value: {
    color: "#DDD",
    fontSize: 12,
  },

  timeline: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 10,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#D4AF37",
    borderRadius: 10,
    marginRight: 8,
  },

  step: {
    color: "#CCC",
    fontSize: 12,
  },
});