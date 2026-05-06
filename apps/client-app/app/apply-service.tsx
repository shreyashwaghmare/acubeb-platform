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
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { usePremiumToast } from "../components/PremiumToast";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';

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
    if (!projectName || !siteAddress || !contactPerson) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Deployment parameters incomplete.", "error");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await api.createRequest(user?.token || "", {
        service: String(service),
        project: projectName,
        site: siteAddress,
        contact_person: contactPerson,
        sample_qty: sampleQty,
        remarks,
      });

      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Mission deployed successfully", "success");
        await refreshRequests();
        setTimeout(() => {
          router.push("/(tabs)/requests");
        }, 800);
      } else {
        showToast(res.message || "Protocol failed", "error");
      }
    } catch (error) {
      showToast("System error during deployment.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP STATUS HEADER */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.headerArea}>
          <Text style={styles.metaLabel}>NEW DEPLOYMENT</Text>
          <Text style={styles.serviceTitle}>{String(service)}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>AWAITING PARAMETERS</Text>
          </View>
        </Animated.View>

        {/* FORM SECTION */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PROJECT IDENTIFICATION</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Skyline Residency Phase II" 
              placeholderTextColor="#444" 
              value={projectName} 
              onChangeText={setProjectName} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SITE GEO-LOCATION / ADDRESS</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Full site coordinates or address" 
              placeholderTextColor="#444" 
              value={siteAddress} 
              onChangeText={setSiteAddress} 
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1.5, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>POC / CONTACT</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Name" 
                placeholderTextColor="#444" 
                value={contactPerson} 
                onChangeText={setContactPerson} 
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>QTY</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Units" 
                placeholderTextColor="#444" 
                keyboardType="numeric" 
                value={sampleQty} 
                onChangeText={setSampleQty} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SPECIAL INSTRUCTIONS / REMARKS</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional technical notes..."
              placeholderTextColor="#444"
              multiline
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>
        </Animated.View>

        {/* SUBMIT BUTTON */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={submitRequest}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.buttonText}>SUBMIT REQUEST</Text>
                <Text style={styles.btnIcon}>🚀</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.footerNote}>By initiating, you agree to technical audit protocols.</Text>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808", padding: 18 },
  scrollContent: { paddingBottom: 150 },
  
  // Header
  headerArea: { marginTop: 40, marginBottom: 25 },
  metaLabel: { color: "#555", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  serviceTitle: { color: "#D4AF37", fontSize: 28, fontWeight: "900", marginTop: 5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#111', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#1A1A1A' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37', marginRight: 8, opacity: 0.8 },
  statusText: { color: '#888', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  // Form Card
  formCard: { backgroundColor: "#111", borderRadius: 28, padding: 20, borderWidth: 1, borderColor: "#1A1A1A", marginBottom: 25 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: "#D4AF37", fontSize: 9, fontWeight: "900", letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: 'row' },
  
  input: {
    backgroundColor: "#0C0C0C",
    color: "#FFF",
    padding: 16,
    borderRadius: 18,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  textArea: { height: 100, textAlignVertical: "top" },

  // Button
  button: { 
    backgroundColor: "#D4AF37", 
    height: 60, 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: "#000", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  btnIcon: { marginLeft: 10, fontSize: 18 },
  
  footerNote: { color: "#444", fontSize: 10, textAlign: 'center', marginTop: 15, fontWeight: '600' }
});