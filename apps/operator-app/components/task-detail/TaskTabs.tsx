import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type TaskTabKey = "client" | "workflow" | "evidence" | "timeline";

const tabs: { key: TaskTabKey; label: string }[] = [
  { key: "client", label: "Client" },
  { key: "workflow", label: "Workflow" },
  { key: "evidence", label: "Evidence" },
  { key: "timeline", label: "Timeline" },
];

export default function TaskTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: TaskTabKey;
  setActiveTab: (tab: TaskTabKey) => void;
}) {
  return (
    <View style={styles.tabRow}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, isActive && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: "#1C1C1C",
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabBtn: {
    backgroundColor: "#D4AF37",
  },
  tabText: {
    color: "#777",
    fontSize: 11,
    fontWeight: "900",
  },
  activeTabText: {
    color: "#000",
  },
});