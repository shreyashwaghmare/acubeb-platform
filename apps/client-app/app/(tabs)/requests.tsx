import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function RequestsScreen() {
  const { requests, refreshRequests } = useAppContext();

  // 🔥 Refresh when screen opens
  useFocusEffect(
    useCallback(() => {
      refreshRequests();
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.heading}>My Requests</Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>No requests found</Text>
      ) : (
        requests.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              router.push(`/request-detail?id=${item.id}`)
            }
          >
            <Text style={styles.gold}>{item.requestNo}</Text>
            <Text style={styles.title}>{item.service}</Text>
            <Text style={styles.text}>Project: {item.project}</Text>
            <Text style={styles.text}>Site: {item.site}</Text>
            <Text style={styles.text}>Date: {item.date}</Text>
            <Text style={styles.status}>{item.status}</Text>

            <View style={styles.timeline}>
              {item.timeline.map((step, index) => (
                <Text key={index} style={styles.step}>
                  ✓ {step}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },
  heading: { color: "#D4AF37", fontSize: 24, fontWeight: "900", marginVertical: 20 },
  empty: { color: "#888", textAlign: "center", marginTop: 40 },

  card: { backgroundColor: "#1B1B1B", padding: 18, borderRadius: 16, marginBottom: 14 },
  gold: { color: "#D4AF37", fontWeight: "800" },
  title: { color: "#FFF", fontSize: 17, fontWeight: "800", marginTop: 6 },
  text: { color: "#AAA", marginTop: 5 },
  status: { color: "#90EE90", marginTop: 8, fontWeight: "800" },

  timeline: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 10,
  },
  step: { color: "#DDD", marginTop: 5 },
});