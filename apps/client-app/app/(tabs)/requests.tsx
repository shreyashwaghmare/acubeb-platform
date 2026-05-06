import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { useAppContext } from "../../context/AppContext";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";

export default function RequestsScreen() {
  const { requests, refreshRequests } = useAppContext();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filters = ["ALL", "PENDING", "TESTING", "COMPLETED"];

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          await refreshRequests();
        } catch (e) {
          console.log("REQUESTS REFRESH ERROR:", e);
        }
      };

      load();
    }, [refreshRequests])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      try {
        await Haptics.impactAsync(
          Haptics.ImpactFeedbackStyle.Light
        );
      } catch {}

      await refreshRequests();
    } catch (e) {
      console.log("PULL REFRESH ERROR:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const safeRequests = Array.isArray(requests) ? requests : [];

  const filteredRequests = safeRequests.filter((req) => {
    const service = String(req?.service || "").toLowerCase();
    const requestNo = String(req?.requestNo || "").toLowerCase();
    const project = String(req?.project || "").toLowerCase();

    const status = normalizeStatus(req?.status);

    const searchTerm = search.toLowerCase();

    const matchesSearch =
      service.includes(searchTerm) ||
      requestNo.includes(searchTerm) ||
      project.includes(searchTerm);

    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "COMPLETED" &&
        (status.includes("COMPLETED") ||
          status.includes("SHARED") ||
          status.includes("APPROVED"))) ||
      (activeFilter === "TESTING" &&
        (status.includes("TESTING") ||
          status.includes("PROGRESS") ||
          status.includes("VISIT"))) ||
      (activeFilter === "PENDING" &&
        (status.includes("NEW_REQUEST") ||
          status.includes("PENDING") ||
          status.includes("REQUEST")));

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.metaLabel}>
          TRACKING & LOGISTICS
        </Text>

        <Text style={styles.heading}>
          Active Deployments
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search Project, Service, or ID..."
            placeholderTextColor="#444"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}

                setActiveFilter(f);
              }}
              style={[
                styles.filterChip,
                activeFilter === f &&
                  styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f &&
                    styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 150,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
          />
        }
      >
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>

            <Text style={styles.empty}>
              No matching deployments found.
            </Text>
          </View>
        ) : (
          filteredRequests.map((item, index) => (
            <RequestCard
              key={String(item?.id || index)}
              item={item}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function RequestCard({ item }: { item: any }) {
  const status = normalizeStatus(item?.status);

  const progressWidth = getProgressWidth(status);

  const openDetail = async () => {
    if (!item?.id) {
      console.log("REQUEST ID MISSING:", item);
      return;
    }

    try {
      await Haptics.selectionAsync();
    } catch {}

    router.push({
      pathname: "/request-detail",
      params: {
        id: String(item.id),
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={openDetail}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.requestNo}>
          {item?.requestNo || "ACB-REQ"}
        </Text>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor:
                getStatusColor(status) + "15",
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  getStatusColor(status),
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: getStatusColor(status),
              },
            ]}
          >
            {status.split("_").join(" ")}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>
        {item?.service || "Service Request"}
      </Text>

      <View style={styles.bentoRow}>
        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>
            PROJECT
          </Text>

          <Text
            style={styles.bentoValue}
            numberOfLines={1}
          >
            {item?.project || "Unnamed Project"}
          </Text>
        </View>

        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>
            SITE
          </Text>

          <Text style={styles.bentoValue}>
            {item?.site || "Global"}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor:
                  getStatusColor(status),
                width: progressWidth,
              },
            ]}
          />
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            Project Momentum
          </Text>

          <Text style={styles.progressText}>
            {progressWidth}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const normalizeStatus = (status?: string) => {
  return String(status || "NEW_REQUEST")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
};

const getStatusColor = (status?: string) => {
  const s = normalizeStatus(status);

  if (
    s.includes("COMPLETED") ||
    s.includes("SHARED") ||
    s.includes("APPROVED")
  ) {
    return "#4CAF50";
  }

  if (
    s.includes("PROGRESS") ||
    s.includes("TESTING") ||
    s.includes("VISIT")
  ) {
    return "#FF9800";
  }

  return "#D4AF37";
};

const getProgressWidth = (status?: string) => {
  const s = normalizeStatus(status);

  if (
    s.includes("COMPLETED") ||
    s.includes("SHARED")
  ) {
    return "100%";
  }

  if (
    s.includes("APPROVED") ||
    s.includes("REPORT")
  ) {
    return "85%";
  }

  if (s.includes("TESTING")) {
    return "60%";
  }

  if (
    s.includes("VISIT") ||
    s.includes("PROGRESS")
  ) {
    return "40%";
  }

  return "15%";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    paddingHorizontal: 18,
  },

  topHeader: {
    marginTop: 60,
    marginBottom: 20,
  },

  metaLabel: {
    color: "#444",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },

  heading: {
    color: "#D4AF37",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },

  searchContainer: {
    backgroundColor: "#121212",
    borderRadius: 16,
    height: 50,
    marginTop: 20,
    paddingHorizontal: 15,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },

  searchInput: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  filterScroll: {
    marginTop: 15,
    flexDirection: "row",
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#111",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },

  filterChipActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },

  filterText: {
    color: "#555",
    fontSize: 10,
    fontWeight: "900",
  },

  filterTextActive: {
    color: "#000",
  },

  emptyContainer: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 15,
  },

  empty: {
    color: "#444",
    fontWeight: "700",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  requestNo: {
    color: "#555",
    fontSize: 12,
    fontWeight: "900",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  title: {
    color: "#FFF",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 14,
  },

  bentoRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 15,
  },

  bentoItem: {
    flex: 1,
    backgroundColor: "#0C0C0C",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#151515",
  },

  bentoLabel: {
    color: "#D4AF37",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  bentoValue: {
    color: "#AAA",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  progressSection: {
    marginTop: 20,
  },

  progressBarBg: {
    height: 4,
    backgroundColor: "#1A1A1A",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  progressText: {
    color: "#444",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});