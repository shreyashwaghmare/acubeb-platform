import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useAppContext, OperatorTaskItem } from "../../context/AppContext";
import { usePremiumToast } from "../../components/PremiumToast";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

export default function TasksScreen() {
  const { logout, user } = useAuth();
  const { tasks, refreshTasks, loadingTasks } = useAppContext();
  const { showToast } = usePremiumToast();

  const assignedCount = tasks.length;
  const sampleCollectedCount = tasks.filter((t) => t.status === "SAMPLE_COLLECTED").length;
  const testingCount = tasks.filter((t) => t.status === "TESTING_IN_PROGRESS").length;
  const reportReadyCount = tasks.filter((t) => t.status === "REPORT_READY").length;

  const operatorDisplayName =
    user?.name?.replace(/^Dr\.\s*/i, "").split(" ")[0] || "Operator";

  const handleLogoutAction = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await logout();
      showToast("Terminal session closed successfully", "info");
    } catch {
      showToast("Failed to terminate session securely", "error");
    }
  };

  const handlePullToRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshTasks();
  };

  const openTask = (item: OperatorTaskItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    router.push({
      pathname: "/task-detail",
      params: { id: item.id },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPERATOR_ASSIGNED":
        return "#D4AF37";
      case "SAMPLE_COLLECTED":
        return "#9C27B0";
      case "LAB_RECEIVED":
        return "#2196F3";
      case "TESTING_IN_PROGRESS":
        return "#FF9800";
      case "REPORT_READY":
        return "#2E7D32";
      default:
        return "#777";
    }
  };

  const renderTaskCard = ({ item }: { item: OperatorTaskItem }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => openTask(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.requestNo}>{item.requestNo}</Text>

          <View style={[styles.statusBadge, { borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replaceAll("_", " ")}
            </Text>
          </View>
        </View>

        <Text style={styles.projectTitle}>{item.project}</Text>
        <Text style={styles.serviceText}>{item.service}</Text>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color="#555" />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.site}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#444" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.profileGreeting}>Good Morning 👋</Text>
          <Text style={styles.operatorName}>{operatorDisplayName}</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogoutAction}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{assignedCount}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{sampleCollectedCount}</Text>
          <Text style={styles.statLabel}>Collected</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{testingCount}</Text>
          <Text style={styles.statLabel}>Testing</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{reportReadyCount}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={loadingTasks}
            onRefresh={handlePullToRefresh}
            tintColor="#D4AF37"
            colors={["#D4AF37"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#222" />
            <Text style={styles.emptyText}>No operational files pending sync.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  profileGreeting: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
  },

  operatorName: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },

  logoutBtn: {
    backgroundColor: "#111",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },

  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1C1C1C",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  statValue: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "900",
  },

  statLabel: {
    color: "#777",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1C1C1C",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  requestNo: {
    color: "#555",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  projectTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },

  serviceText: {
    color: "#999",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#1C1C1C",
    marginBottom: 12,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  metaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 12,
  },

  emptyText: {
    color: "#444",
    fontSize: 14,
    fontWeight: "600",
  },
});