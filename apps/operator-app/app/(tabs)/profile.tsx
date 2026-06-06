import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { usePremiumToast } from "../../components/PremiumToast";
import { useAppContext } from "../../context/AppContext";
import { api } from "../../services/api";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { tasks } = useAppContext();
  const { showToast } = usePremiumToast();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name || "Field Operator");
  const [email, setEmail] = useState(user?.email || "");

  const testingCount = tasks.filter((t) => t.status === "TESTING_IN_PROGRESS").length;
  const reportReadyCount = tasks.filter((t) => t.status === "REPORT_READY").length;
  const labReceivedCount = tasks.filter((t) => t.status === "LAB_RECEIVED").length;

const handleSave = async () => {
  if (!user?.token) {
    showToast("Session expired", "error");
    return;
  }

  try {
    const result = await api.updateProfile(
      user.token,
      name,
      email
    );

    if (result.success) {
      showToast("Profile updated", "success");
      setEditOpen(false);
    } else {
      showToast(result.message || "Profile update failed", "error");
    }
  } catch {
    showToast("Update failed", "error");
  }
};

  const handleLogout = async () => {
    await logout();
    showToast("Logged out successfully", "info");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.meta}>OPERATOR PROFILE</Text>
      <Text style={styles.title}>My Account</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={32} color="#000" />
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.mobile}>{user?.mobile || "Mobile not available"}</Text>

        <TouchableOpacity style={styles.editBtn} onPress={() => setEditOpen(true)}>
          <Ionicons name="create-outline" size={16} color="#000" />
          <Text style={styles.editText}>EDIT PROFILE</Text>
        </TouchableOpacity>

        <InfoRow label="Role" value={user?.role || "operator"} />
        <InfoRow label="Email" value={email || "Not added"} />
        <InfoRow label="User ID" value={user?.uid || "Not available"} />
      </View>

      <Text style={styles.sectionLabel}>TODAY&apos;S WORKLOAD</Text>

      <View style={styles.statsGrid}>
        <Stat label="Assigned" value={tasks.length} />
        <Stat label="Lab" value={labReceivedCount} />
        <Stat label="Testing" value={testingCount} />
        <Stat label="Reports" value={reportReadyCount} />
      </View>

      <Text style={styles.sectionLabel}>OPERATOR DETAILS</Text>

      <View style={styles.systemCard}>
        <InfoLine icon="shield-checkmark-outline" label="Session" value="Active" />
        <InfoLine icon="briefcase-outline" label="Department" value="Field Operations" />
        <InfoLine icon="location-outline" label="GPS Tracking" value="Enabled" />
        <InfoLine icon="camera-outline" label="Evidence Upload" value="Enabled" />
        <InfoLine icon="server-outline" label="Sync" value="Live PostgreSQL" />
        <InfoLine icon="phone-portrait-outline" label="App" value="Operator Console v1.0" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#000" />
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>

      <Modal visible={editOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#555"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="operator@email.com"
              placeholderTextColor="#555"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>SAVE PROFILE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.systemRow}>
      <View style={styles.systemLeft}>
        <Ionicons name={icon} size={16} color="#D4AF37" />
        <Text style={styles.systemLabel}>{label}</Text>
      </View>
      <Text style={styles.systemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  content: { padding: 22, paddingTop: 60, paddingBottom: 40 },
  meta: { color: "#555", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  title: { color: "#D4AF37", fontSize: 30, fontWeight: "900", marginTop: 6, marginBottom: 24 },
  card: { backgroundColor: "#111", borderWidth: 1, borderColor: "#1C1C1C", borderRadius: 18, padding: 22, alignItems: "center" },
  avatar: { width: 70, height: 70, borderRadius: 22, backgroundColor: "#D4AF37", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  name: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  mobile: { color: "#777", fontSize: 13, fontWeight: "700", marginTop: 4, marginBottom: 14 },
  editBtn: { backgroundColor: "#D4AF37", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 18 },
  editText: { color: "#000", fontSize: 12, fontWeight: "900" },
  infoRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#1C1C1C", paddingVertical: 14, gap: 12 },
  label: { color: "#666", fontSize: 12, fontWeight: "800" },
  value: { color: "#DDD", fontSize: 12, fontWeight: "700", maxWidth: "65%", textAlign: "right" },
  sectionLabel: { color: "#555", fontSize: 11, fontWeight: "900", letterSpacing: 1, marginTop: 24, marginBottom: 10 },
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: "#111", borderWidth: 1, borderColor: "#1C1C1C", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  statValue: { color: "#D4AF37", fontSize: 21, fontWeight: "900" },
  statLabel: { color: "#777", fontSize: 10, fontWeight: "800", marginTop: 4 },
  systemCard: { backgroundColor: "#111", borderWidth: 1, borderColor: "#1C1C1C", borderRadius: 16, padding: 14 },
  systemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" },
  systemLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  systemLabel: { color: "#777", fontSize: 12, fontWeight: "800" },
  systemValue: { color: "#DDD", fontSize: 12, fontWeight: "700" },
  logoutBtn: { marginTop: 24, height: 52, borderRadius: 14, backgroundColor: "#D4AF37", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoutText: { color: "#000", fontSize: 13, fontWeight: "900" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#111", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, borderWidth: 1, borderColor: "#222" },
  modalTitle: { color: "#D4AF37", fontSize: 24, fontWeight: "900", marginBottom: 18 },
  inputLabel: { color: "#777", fontSize: 11, fontWeight: "900", marginBottom: 8 },
  input: { backgroundColor: "#080808", borderWidth: 1, borderColor: "#222", color: "#FFF", height: 50, borderRadius: 12, paddingHorizontal: 14, marginBottom: 14 },
  saveBtn: { backgroundColor: "#D4AF37", height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 4 },
  saveText: { color: "#000", fontWeight: "900" },
  cancelBtn: { height: 46, alignItems: "center", justifyContent: "center", marginTop: 8 },
  cancelText: { color: "#777", fontWeight: "800" },
});