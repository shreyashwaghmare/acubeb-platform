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
  const { service, code, formLayout, unit } = useLocalSearchParams();
  const { refreshRequests } = useAppContext();
  const { user } = useAuth();
  const { showToast } = usePremiumToast();

  const [projectName, setProjectName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [quantityValue, setQuantityValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const getQuantityPlaceholder = () => {
    if (formLayout === "consultancy") return "e.g. 3 (Visits / Projected Months)";
    if (formLayout === "volumetric") return "e.g. 1500 (Cubic Meters)";
    if (formLayout === "linear") return "e.g. 500 (Chainage Meters)";
    if (formLayout === "planar") return "e.g. 3000 (Square Meters)";
    if (formLayout === "weight") return "e.g. 400 (Metric Tonnes)";
    return "e.g. 1 (Total Bulkers / Batches)";
  };

  const getAddressPlaceholder = () => {
    if (formLayout === "consultancy") return "Structure Location / Commercial Asset Address";
    if (formLayout === "statutory") return "Ref Standard / Batch Identification Info";
    return "Ch. Link Details (e.g. Km 42+300 to 45+100 RHS)";
  };

  const submitRequest = async () => {
    if (!projectName || !siteAddress || !contactPerson || !quantityValue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Deployment parameters incomplete.", "error");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await api.createRequest(user?.token || "", {
        service: `${service} [${code}]`,
        project: projectName,
        site: siteAddress,
        contact_person: contactPerson,
        sample_qty: `${quantityValue} ${unit || "units"}`,
        remarks: remarks || "Technical audit and engineering compliance routing track.",
      });

      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Request scheduled successfully", "success");
        await refreshRequests();
        setTimeout(() => {
          router.push("/(tabs)/requests");
        }, 800);
      } else {
        showToast(res.message || "Protocol failed", "error");
      }
    } catch (error) {
      showToast("System error during request deployment.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInUp.delay(100)} style={styles.headerArea}>
          <Text style={styles.metaLabel}>NEW INFRASTRUCTURE ASSIGNMENT</Text>
          <Text style={styles.serviceTitle}>{String(service)}</Text>
          <Text style={styles.codeSubtitle}>Reference Protocol: {String(code)}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PROJECT IDENTIFICATION / SUBCONTRACTOR</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Pune-Nashik Highway Widening, Pkg 2" 
              placeholderTextColor="#444" 
              value={projectName} 
              onChangeText={setProjectName} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SITE RANGE / SPATIAL LOCATION COORDINATES</Text>
            <TextInput 
              style={styles.input} 
              placeholder={getAddressPlaceholder()} 
              placeholderTextColor="#444" 
              value={siteAddress} 
              onChangeText={setSiteAddress} 
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1.4, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>ENGINEER IN-CHARGE / POC</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Name & Contact Details" 
                placeholderTextColor="#444" 
                value={contactPerson} 
                onChangeText={setContactPerson} 
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>QUANTITY ({String(unit).toUpperCase()})</Text>
              <TextInput 
                style={styles.input} 
                placeholder={getQuantityPlaceholder()}
                placeholderTextColor="#444" 
                keyboardType="numeric" 
                value={quantityValue} 
                onChangeText={setQuantityValue} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ADDITIONAL REMARKS / COMPLIANCE NOTES</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Schedule visual inspection of shear walls alongside structural core compression review loops..."
              placeholderTextColor="#444"
              multiline
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={submitRequest}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#000" /> : (
              <View style={styles.btnContent}>
                <Text style={styles.buttonText}>SUBMIT MISSION REQUEST</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808", padding: 18 },
  scrollContent: { paddingBottom: 150 },
  headerArea: { marginTop: 40, marginBottom: 20 },
  metaLabel: { color: "#555", fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  serviceTitle: { color: "#D4AF37", fontSize: 24, fontWeight: "900", marginTop: 5 },
  codeSubtitle: { color: "#888", fontSize: 11, fontWeight: "600", marginTop: 4 },
  formCard: { backgroundColor: "#111", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#1A1A1A", marginBottom: 20 },
  inputGroup: { marginBottom: 18 },
  inputLabel: { color: "#D4AF37", fontSize: 9, fontWeight: "900", letterSpacing: 1, marginBottom: 6, marginLeft: 2 },
  row: { flexDirection: 'row' },
  input: { backgroundColor: "#0C0C0C", color: "#FFF", padding: 14, borderRadius: 14, fontSize: 13, fontWeight: '600', borderWidth: 1, borderColor: "#1A1A1A" },
  textArea: { height: 90, textAlignVertical: "top" },
  button: { backgroundColor: "#D4AF37", height: 54, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: "#000", fontWeight: "900", fontSize: 14, letterSpacing: 1 }
});