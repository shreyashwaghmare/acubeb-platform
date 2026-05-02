import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { client } = useAppContext();
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{client.name || "Client"}</Text>
        <Text style={styles.sub}>Client Account</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Mobile</Text>
        <Text style={styles.value}>{client.mobile || "N/A"}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{client.email || "Not added"}</Text>

        <Text style={styles.label}>GST</Text>
        <Text style={styles.value}>{client.gst || "Not added"}</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{client.address || "Not added"}</Text>
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/edit-profile")}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
  await logout();
  router.replace("/login");
}}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },

  heading: { color: "#D4AF37", fontSize: 26, fontWeight: "900", marginVertical: 20 },

  card: {
    backgroundColor: "#1B1B1B",
    padding: 20,
    borderRadius: 20,
  },

  name: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  sub: { color: "#888", marginBottom: 10 },

  divider: { height: 1, backgroundColor: "#333", marginVertical: 12 },

  label: { color: "#777", marginTop: 10 },
  value: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  button: {
    backgroundColor: "#D4AF37",
    padding: 14,
    borderRadius: 14,
    marginTop: 20,
  },

  buttonText: {
    textAlign: "center",
    fontWeight: "900",
    color: "#111",
  },

  logoutButton: {
    backgroundColor: "#FF4D4D",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
  },

  logoutText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "900",
  },
});