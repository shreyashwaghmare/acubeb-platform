import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { usePremiumToast } from "../components/PremiumToast";

export default function ApplyServiceScreen() {
  const { service } = useLocalSearchParams();
  const { refreshRequests } = useAppContext();
  const { user } = useAuth();
  const { showToast } = usePremiumToast();
  const [projectName, setProjectName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [sampleQty, setSampleQty] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    console.log("SUBMIT CLICKED");

    if (!projectName || !siteAddress || !contactPerson) {
      showToast("Please fill project name, site address and contact person.", "error");
      return;
    }

    if (!user?.token) {
      showToast("Session expired. Please login again.", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await api.createRequest(user.token, {
        service: String(service),
        project: projectName,
        site: siteAddress,
        contact_person: contactPerson,
        sample_qty: sampleQty,
        remarks,
      });

      console.log("Create Request Response:", res);

      if (res.success) {
        showToast("Request submitted successfully", "success");
        await refreshRequests();
        setTimeout(() => {
        router.replace("/(tabs)/requests");
      }, 500);
      } else {
        showToast(res.message || "Failed to create request", "error");
      }
    } catch (error) {
      console.log("Create Request Error:", error);
       showToast("Something went wrong while creating request.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.heading}>Apply Service</Text>
      <Text style={styles.service}>{String(service)}</Text>

      <TextInput style={styles.input} placeholder="Project Name" placeholderTextColor="#777" value={projectName} onChangeText={setProjectName} />
      <TextInput style={styles.input} placeholder="Site Address" placeholderTextColor="#777" value={siteAddress} onChangeText={setSiteAddress} />
      <TextInput style={styles.input} placeholder="Contact Person" placeholderTextColor="#777" value={contactPerson} onChangeText={setContactPerson} />
      <TextInput style={styles.input} placeholder="Sample Quantity" placeholderTextColor="#777" keyboardType="numeric" value={sampleQty} onChangeText={setSampleQty} />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Remarks / Special Instructions"
        placeholderTextColor="#777"
        multiline
        value={remarks}
        onChangeText={setRemarks}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={submitRequest}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Submitting..." : "Submit Request"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },
  heading: { color: "#D4AF37", fontSize: 26, fontWeight: "900", marginTop: 20 },
  service: { color: "#FFF", fontSize: 18, fontWeight: "800", marginTop: 8, marginBottom: 20 },
  input: {
    backgroundColor: "#1B1B1B",
    color: "#FFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  textArea: { height: 110, textAlignVertical: "top" },
  button: { backgroundColor: "#D4AF37", padding: 15, borderRadius: 14, marginTop: 10 },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: "#111", textAlign: "center", fontWeight: "900", fontSize: 16 },
});