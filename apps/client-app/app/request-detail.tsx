import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Linking 
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { api } from "../services/api";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { usePremiumToast } from "../components/PremiumToast";

export default function RequestDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { requests, refreshRequests } = useAppContext();
  const { showToast } = usePremiumToast();

  const scrollRef = useRef<ScrollView>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const request = requests.find((item) => item.id === String(id));
  
  // Animation Shared Values
  const pulse = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  // Status-based logic
  const progressPercent = getProgressPercent(request?.status || "NEW_REQUEST");
  const statusColor = getStatusColor(request?.status || "NEW_REQUEST");

  // Pulse animation for active status
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  useEffect(() => {
    progressWidth.value = withTiming(progressPercent, { duration: 1000 });
  }, [progressPercent]);

  // Data Fetching
  const fetchTimeline = async () => {
    if (!user?.token || !id) return;
    const res = await api.getRequestHistory(user.token, String(id));
    if (res.success) {
      setTimeline(res.data || []);
    }
  };

  const refreshAll = async () => {
    try {
      setLoadingHistory(true);
      await Promise.all([refreshRequests(), fetchTimeline()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, []);

  // Polling (60s for efficiency)
  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => refreshAll(), 60000);
    return () => clearInterval(interval);
  }, [id, user?.token]);

  // Auto-scroll to latest update
  useEffect(() => {
    if (timeline.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [timeline.length]);

  if (!request) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Request not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)/requests")}>
          <Text style={styles.backButtonText}>Back to Requests</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayTimeline = timeline.length > 0 ? timeline : [{
    status: request.status || "NEW_REQUEST",
    updated_by: "system",
    created_at: request.date,
    remarks: "Request created and waiting for admin review.",
  }];

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
      }
    >
      <Text style={styles.heading}>Service Tracking</Text>

      {/* Hero Card */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.heroCard}>
        <Text style={styles.requestNo}>{request.requestNo}</Text>
        <Text style={styles.service}>{request.service}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={styles.statusPillText}>{formatStatus(request.status)}</Text>
        </View>
      </Animated.View>

      {/* Interactive Progress Card */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressTitle}>Project Completion</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
        </View>
        <Text style={styles.progressLabel}>{getProgressStage(request.status)}</Text>
      </Animated.View>

      {/* Operator/Team Card */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.operatorCard}>
        <TouchableOpacity 
          style={styles.avatar} 
          onPress={() => Linking.openURL('tel:9881967899')}
        >
          <Text style={styles.avatarText}>ACB</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.operatorTitle}>A Cube B Operations Team</Text>
          <Text style={styles.operatorSub}>{getOperatorMessage(request.status)}</Text>
        </View>
      </Animated.View>

      {/* Project Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Project Information</Text>
        <InfoRow label="Project" value={request.project} />
        <InfoRow label="Site Address" value={request.site} />
        <InfoRow label="Request Date" value={request.date} />
      </View>

      {/* Modern Timeline */}
      <View style={styles.sectionHeader}>
        <Text style={styles.timelineHeading}>Live Status Feed</Text>
        <Text style={styles.refreshText}>{loadingHistory ? "Syncing..." : "Live Updates"}</Text>
      </View>

      <View style={styles.timelineCard}>
        {displayTimeline.map((item, index) => {
          const isLast = index === displayTimeline.length - 1;
          const itemColor = getStatusColor(item.status);
          return (
            <Animated.View key={index} entering={FadeInDown.delay(index * 100).springify()} style={styles.row}>
              <View style={styles.left}>
                <View style={styles.dotWrap}>
                  {isLast && <Animated.View style={[styles.pulseRing, pulseStyle, { borderColor: itemColor }]} />}
                  <View style={[styles.dot, { backgroundColor: itemColor, shadowColor: itemColor }]} />
                </View>
                {!isLast && <View style={styles.line} />}
              </View>
              <View style={styles.right}>
                <Text style={[styles.timelineStatus, isLast && styles.activeStatus]}>{formatStatus(item.status)}</Text>
                <Text style={styles.meta}>{item.updated_by || "System Agent"} • {String(item.created_at).split("T")[0]}</Text>
                {item.remarks && <Text style={styles.remarks}>{item.remarks}</Text>}
              </View>
            </Animated.View>
          );
        })}
      </View>

      {/* Reports Section */}
      {isReportReady(request.status) && (
        <Animated.View entering={FadeInDown.springify()} style={styles.reportReadyBanner}>
          <Text style={styles.reportReadyTitle}>Final Report Released</Text>
          <Text style={styles.reportReadyText}>The certified structural report is now available for download.</Text>
        </Animated.View>
      )}

      <TouchableOpacity
        style={[styles.reportButton, !isReportReady(request.status) && styles.disabledReportButton]}
        onPress={async () => {
          if (!isReportReady(request.status)) return showToast("Report in preparation", "info");
          try {
            const res = await api.getReportByRequestId(request.id, user?.token || "");
            if (res.success) {
              showToast("Downloading report...", "success");
              router.push(`/report-detail?id=${res.data.id}`);
            }
          } catch (e) { showToast("Connection error", "error"); }
        }}
      >
        <Text style={styles.reportButtonText}>
          {isReportReady(request.status) ? "View Digital Report" : "Report Preparation In-Progress"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)/requests")}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- HELPER FUNCTIONS ---

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Pending Update"}</Text>
    </View>
  );
}

function formatStatus(status: string) {
  return String(status || "NEW_REQUEST").replaceAll("_", " ");
}

function getStatusColor(status?: string) {
  switch (status) {
    case "NEW_REQUEST": return "#D4AF37";
    case "OPERATOR_ASSIGNED": return "#42A5F5";
    case "SAMPLE_COLLECTED": return "#AB47BC";
    case "TESTING_IN_PROGRESS": return "#FF9800";
    case "COMPLETED": return "#4CAF50";
    default: return "#D4AF37";
  }
}

function getProgressPercent(status: string) {
  const steps: Record<string, number> = { "NEW_REQUEST": 15, "OPERATOR_ASSIGNED": 35, "SAMPLE_COLLECTED": 55, "TESTING_IN_PROGRESS": 80, "COMPLETED": 100 };
  return steps[status] || 15;
}

function getProgressStage(status: string) {
  switch (status) {
    case "NEW_REQUEST": return "Vetting Request";
    case "OPERATOR_ASSIGNED": return "Dispatching Field Team";
    case "SAMPLE_COLLECTED": return "Analyzing Material";
    case "TESTING_IN_PROGRESS": return "Compiling Structural Data";
    default: return "Service Finalized";
  }
}

function getOperatorMessage(status: string) {
  if (status === "COMPLETED") return "Final report shared with client.";
  return "Engineering lead is monitoring your site data.";
}

function isReportReady(status: string) {
  return ["REPORT_APPROVED", "FINAL_REPORT_SHARED", "COMPLETED"].includes(status);
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A", padding: 18 },
  heading: { color: "#D4AF37", fontSize: 26, fontWeight: "900", marginVertical: 20 },
  heroCard: { backgroundColor: "#151515", padding: 22, borderRadius: 24, marginBottom: 14, borderWidth: 1, borderColor: "#222" },
  requestNo: { color: "#D4AF37", fontWeight: "900", opacity: 0.8 },
  service: { color: "#FFF", fontSize: 24, fontWeight: "900", marginTop: 8 },
  statusPill: { alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginTop: 16 },
  statusPillText: { color: "#000", fontWeight: "900", fontSize: 12 },
  progressCard: { backgroundColor: "#151515", padding: 18, borderRadius: 20, marginBottom: 14, borderWidth: 1, borderColor: "#222" },
  progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { color: "#D4AF37", fontWeight: "900" },
  progressPercent: { color: "#FFF", fontWeight: "900" },
  progressTrack: { height: 6, backgroundColor: "#222", borderRadius: 10, marginTop: 14, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#D4AF37" },
  progressLabel: { color: "#777", marginTop: 10, fontWeight: "600", fontSize: 13 },
  operatorCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#151515", padding: 16, borderRadius: 20, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: "#D4AF37" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#D4AF37", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { color: "#000", fontWeight: "900", fontSize: 14 },
  operatorTitle: { color: "#FFF", fontWeight: "900" },
  operatorSub: { color: "#888", marginTop: 3, fontSize: 12 },
  card: { backgroundColor: "#151515", padding: 18, borderRadius: 20, marginBottom: 14 },
  sectionTitle: { color: "#D4AF37", fontSize: 16, fontWeight: "900", marginBottom: 4 },
  infoRow: { marginTop: 12 },
  label: { color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  infoValue: { color: "#EEE", fontSize: 15, fontWeight: "700", marginTop: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginVertical: 12 },
  timelineHeading: { color: "#D4AF37", fontSize: 20, fontWeight: "900" },
  refreshText: { color: "#4CAF50", fontWeight: "800", fontSize: 11, textTransform: "uppercase" },
  timelineCard: { backgroundColor: "#151515", padding: 20, borderRadius: 24, marginBottom: 14 },
  row: { flexDirection: "row", marginBottom: 24 },
  left: { width: 30, alignItems: "center" },
  dotWrap: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
  pulseRing: { position: "absolute", width: 26, height: 26, borderRadius: 13, borderWidth: 1.5 },
  dot: { width: 12, height: 12, borderRadius: 6, elevation: 10, shadowRadius: 10, shadowOpacity: 0.5 },
  line: { width: 1.5, flex: 1, backgroundColor: "#333", marginTop: 4 },
  right: { flex: 1, paddingLeft: 12 },
  timelineStatus: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  activeStatus: { color: "#D4AF37" },
  meta: { color: "#666", fontSize: 11, marginTop: 4 },
  remarks: { color: "#AAA", marginTop: 6, fontSize: 13, lineHeight: 18 },
  reportReadyBanner: { backgroundColor: "#0A2010", borderWidth: 1, borderColor: "#4CAF50", padding: 16, borderRadius: 16, marginBottom: 14 },
  reportReadyTitle: { color: "#4CAF50", fontWeight: "900" },
  reportReadyText: { color: "#A5D6A7", marginTop: 4, fontSize: 12 },
  reportButton: { backgroundColor: "#4CAF50", padding: 18, borderRadius: 16, marginBottom: 14 },
  disabledReportButton: { backgroundColor: "#222" },
  reportButtonText: { color: "#000", textAlign: "center", fontWeight: "900", fontSize: 16 },
  backButton: { backgroundColor: "#D4AF37", padding: 18, borderRadius: 16, marginTop: 10, marginBottom: 40 },
  backButtonText: { color: "#000", textAlign: "center", fontWeight: "900", fontSize: 16 },
});