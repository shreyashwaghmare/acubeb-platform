import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { client } = useAppContext();
  const { logout } = useAuth();

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await logout();
    router.replace("/login");
  };

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconBg}>
        <Ionicons name={icon as any} size={16} color="#D4AF37" />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* EXECUTIVE HEADER */}
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.headerSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{client?.name?.charAt(0) || "C"}</Text>
          </View>
          <Text style={styles.clientName}>{client?.name || "Premium Client"}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VERIFIED CORPORATE ACCOUNT</Text>
          </View>
        </Animated.View>

        {/* PRIMARY DETAILS - BENTO BOX */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.bentoCard}>
          <Text style={styles.sectionTitle}>ORGANIZATION DETAILS</Text>
          
          <InfoRow icon="call-outline" label="Primary Contact" value={client?.mobile || "N/A"} />
          <View style={styles.divider} />
          <InfoRow icon="mail-outline" label="Official Email" value={client?.email || "Not added"} />
          <View style={styles.divider} />
          <InfoRow icon="business-outline" label="GST Identification" value={client?.gst || "Not registered"} />
        </Animated.View>

        {/* ADDRESS SECTION */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.bentoCard}>
          <Text style={styles.sectionTitle}>REGISTERED ADDRESS</Text>
          <View style={styles.addressWrapper}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.addressText}>{client?.address || "No address on file"}</Text>
          </View>
        </Animated.View>

        {/* ACTIONS */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/edit-profile");
            }}
          >
            <Ionicons name="create-outline" size={18} color="#111" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footerBrand}>A CUBE B SOLUTIONS • 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  // Header
  headerSection: { alignItems: 'center', marginTop: 60, marginBottom: 30 },
  avatarCircle: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: "#111", borderWidth: 1, borderColor: "#D4AF37",
    justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  avatarText: { color: "#D4AF37", fontSize: 32, fontWeight: "800" },
  clientName: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  badge: { 
    backgroundColor: "#D4AF3715", paddingHorizontal: 12, paddingVertical: 4, 
    borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: "#D4AF3730" 
  },
  badgeText: { color: "#D4AF37", fontSize: 9, fontWeight: "900", letterSpacing: 1 },

  // Bento Card
  bentoCard: { 
    backgroundColor: "#111", borderRadius: 24, padding: 20, 
    marginBottom: 15, borderWidth: 1, borderColor: "#1A1A1A" 
  },
  sectionTitle: { color: "#444", fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 18 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  iconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#080808", justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: "#1A1A1A" },
  infoText: { flex: 1 },
  infoLabel: { color: "#555", fontSize: 11, fontWeight: "600" },
  infoValue: { color: "#EEE", fontSize: 15, fontWeight: "700", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#1A1A1A", marginVertical: 12 },

  // Address
  addressWrapper: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  addressText: { color: "#888", fontSize: 14, fontWeight: "500", flex: 1, lineHeight: 20 },

  // Actions
  actionGroup: { marginTop: 15 },
  editButton: {
    backgroundColor: "#D4AF37", height: 56, borderRadius: 18, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8
  },
  editButtonText: { color: "#111", fontWeight: "900", fontSize: 15 },
  
  logoutButton: {
    marginTop: 12, height: 56, borderRadius: 18, 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1, borderColor: "#220000", backgroundColor: "#111"
  },
  logoutText: { color: "#FF4D4D", fontWeight: "900", fontSize: 12, letterSpacing: 2 },
  
  footerBrand: { color: "#333", textAlign: 'center', marginTop: 40, fontSize: 10, fontWeight: "700", letterSpacing: 3 }
});