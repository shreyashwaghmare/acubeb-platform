import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { usePremiumToast } from "../components/PremiumToast";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { api } from "../services/api";
import { ensureFirebaseApp } from "../services/firebase";

export default function AuthScreen() {
  const { login } = useAuth();
  const { showToast } = usePremiumToast();

  const [step, setStep] = useState<"MOBILE" | "OTP">("MOBILE");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [operatorData, setOperatorData] = useState<any>(null);

  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const cleanMobile = mobile.replace(/\D/g, "");

  const handleSendOTP = async () => {
    if (cleanMobile.length !== 10) {
      showToast("Enter a valid 10-digit mobile number", "error");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      ensureFirebaseApp();
      const result = await auth().signInWithPhoneNumber(`+91${cleanMobile}`);

      setConfirmation(result);
      setOperatorData({
        mobile: cleanMobile,
        role: "operator",
      });

      setStep("OTP");
      showToast("OTP sent successfully", "success");
    } catch (error: any) {
      console.log("SEND OTP ERROR:", error);
      showToast(error?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!confirmation) {
      showToast("Please request OTP again", "error");
      return;
    }

    if (!otp.trim()) {
      showToast("Enter OTP", "error");
      return;
    }

    try {
      setLoading(true);

      const credential = await confirmation.confirm(otp.trim());

      if (!credential?.user) {
        showToast("OTP verification failed", "error");
        return;
      }

      const firebaseToken = await credential.user.getIdToken();

      const res = await api.firebaseLogin({
        firebaseToken,
        mobile: cleanMobile,
        provider: "phone",
      });

      if (res.success && res.token) {
        await login(
          res.token,
          res.user.mobile,
          res.user.id,
          res.user.name,
          res.user.email
        );

        showToast("Access granted. Welcome to Operator Console.", "success");
        router.replace("/(tabs)");
      } else {
        showToast(res.message || "Operator access denied", "error");
      }
    } catch (error: any) {
      console.log("VERIFY OTP ERROR:", error);
      showToast(error?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoCard}>
          <View style={styles.logoIcon}>
            <Ionicons name="business-outline" size={34} color="#000" />
          </View>

          <Text style={styles.company}>A CUBE B</Text>
          <Text style={styles.subtitle}>FIELD OPERATIONS CONSOLE</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#D4AF37" />
            <Text style={styles.securityText}>Authorized Operator Access</Text>
          </View>

          <Text style={styles.title}>
            {step === "MOBILE" ? "Secure Login" : "Verify Access"}
          </Text>

          <Text style={styles.description}>
            {step === "MOBILE"
              ? "Enter your registered operator mobile number to receive OTP."
              : `OTP sent to +91 ${cleanMobile}`}
          </Text>

          {step === "MOBILE" ? (
            <>
              <Text style={styles.label}>REGISTERED MOBILE NUMBER</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10 digit mobile number"
                  placeholderTextColor="#444"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSendOTP}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={18} color="#000" />
                    <Text style={styles.primaryText}>SEND OTP</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.operatorPreview}>
                <Ionicons name="person-circle-outline" size={34} color="#D4AF37" />
                <View>
                  <Text style={styles.operatorName}>
                    {operatorData?.name || "Field Operator"}
                  </Text>
                  <Text style={styles.operatorRole}>OPERATOR ACCESS</Text>
                </View>
              </View>

              <Text style={styles.label}>6-DIGIT VERIFICATION CODE</Text>

              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                placeholderTextColor="#333"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleVerifyOTP}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#000" />
                    <Text style={styles.primaryText}>VERIFY & ENTER</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  setStep("MOBILE");
                  setOtp("");
                  setConfirmation(null);
                }}
              >
                <Text style={styles.secondaryText}>Change mobile number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footer}>
          A Cube B Consultants Pvt. Ltd. • SmartLab Field System
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoCard: { alignItems: "center", marginBottom: 34 },
  logoIcon: {
    backgroundColor: "#D4AF37",
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  company: {
    color: "#FFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 5,
  },
  subtitle: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 5,
  },
  panel: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1C1C1C",
    borderRadius: 22,
    padding: 22,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  securityText: {
    color: "#777",
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },
  description: {
    color: "#777",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginBottom: 24,
  },
  label: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#080808",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    height: 54,
    marginBottom: 18,
  },
  countryCode: {
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  otpInput: {
    backgroundColor: "#080808",
    borderWidth: 1,
    borderColor: "#222",
    color: "#D4AF37",
    height: 58,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 8,
    textAlign: "center",
    marginBottom: 18,
  },
  operatorPreview: {
    backgroundColor: "#080808",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  operatorName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
  },
  operatorRole: {
    color: "#777",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
    textTransform: "uppercase",
  },
  primaryBtn: {
    backgroundColor: "#D4AF37",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryText: {
    color: "#777",
    fontSize: 12,
    fontWeight: "800",
  },
  footer: {
    color: "#444",
    textAlign: "center",
    marginTop: 26,
    fontSize: 11,
    fontWeight: "700",
  },
});