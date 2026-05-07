import { ScrollView, Text, View, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useEffect, useState, useCallback,useRef } from "react";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

export default function ReportsScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    if (!user?.token) return;
    try {
      // Assuming your api service has getReports
      const res = await api.getReports(user.token);
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user?.token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, []);

useFocusEffect(
  useCallback(() => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  }, [])
);
  // --- EMPTY STATE COMPONENT ---
  if (!loading && reports.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Report History</Text>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 30 }}>📄</Text>
          </View>
          <Text style={styles.emptyTitle}>No Reports Found</Text>
          <Text style={styles.emptyDesc}>
            Once your site tests are completed and verified by our engineering team, your digital reports will appear here.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/requests")}>
            <Text style={styles.backButtonText}>Check Request Status</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView 
     ref={scrollRef}
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 150 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
      }
    >
      <Text style={styles.heading}>Report History</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 50 }} />
      ) : (
        reports.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/report-detail?id=${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.gold}>{item.reportNo || `REP-${item.id}`}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.status || 'FINAL'}</Text>
                </View>
              </View>

              <Text style={styles.title}>{item.service}</Text>
              <Text style={styles.text}>Project: {item.project}</Text>
              <Text style={styles.text}>Issued: {item.issueDate || item.created_at?.split('T')[0]}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.fillButton]}
                  onPress={() => router.push(`/report-detail?id=${item.id}`)}
                >
                  <Text style={styles.buttonText}>View Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.outlineButton]}>
                  <Text style={styles.outlineText}>Verify QR</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A", padding: 18 },
  heading: { color: "#D4AF37", fontSize: 26, fontWeight: "900", marginVertical: 20 },
  
  // Card Styles
  card: { backgroundColor: "#151515", padding: 18, borderRadius: 20, marginBottom: 14, borderWidth: 1, borderColor: "#222" },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gold: { color: "#D4AF37", fontWeight: "900", fontSize: 13 },
  title: { color: "#FFF", fontSize: 18, fontWeight: "800", marginTop: 8 },
  text: { color: "#888", marginTop: 4, fontSize: 14 },
  
  // Badge
  badge: { backgroundColor: '#4CAF5020', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#4CAF50', fontSize: 10, fontWeight: '900' },

  // Buttons
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionButton: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  fillButton: { backgroundColor: "#D4AF37" },
  outlineButton: { borderColor: "#333", borderWidth: 1 },
  buttonText: { color: "#111", fontWeight: "900", fontSize: 14 },
  outlineText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  // Empty State Styles
  emptyCard: { backgroundColor: "#151515", padding: 30, borderRadius: 24, alignItems: 'center', marginTop: 40, borderWidth: 1, borderColor: "#222" },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1A1A1A", justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "900", marginBottom: 10 },
  emptyDesc: { color: "#777", textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  backButton: { backgroundColor: "#D4AF37", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  backButtonText: { color: "#000", fontWeight: "900" }
});