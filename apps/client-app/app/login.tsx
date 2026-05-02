import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { api } from "../services/api";

export default function LoginScreen() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const sendOtp = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your name or company name.");
      return;
    }

    if (mobile.length < 10) {
      Alert.alert("Invalid Mobile", "Please enter valid mobile number.");
      return;
    }

    setStep(2);
  };

  const verifyOtp = async () => {
    if (otp !== "1234") {
      Alert.alert("Invalid OTP", "Use 1234 for demo login.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.login(mobile, name);

      if (res.success) {
        await login(mobile, res.token, res.user?.name || name);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", res.message || "Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to login. Please check internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>A CUBE B</Text>
      <Text style={styles.subtitle}>Smart Lab Platform</Text>

      {step === 1 ? (
        <>
          <Text style={styles.label}>Name / Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name or company name"
            placeholderTextColor="#777"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor="#777"
            keyboardType="numeric"
            value={mobile}
            onChangeText={setMobile}
          />

          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.info}>OTP sent to {mobile}</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter OTP 1234"
            placeholderTextColor="#777"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabled]}
            onPress={verifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Verify & Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.backText}>Change Details</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", justifyContent: "center", padding: 20 },
  logo: { color: "#D4AF37", fontSize: 34, fontWeight: "900", textAlign: "center" },
  subtitle: { color: "#AAA", textAlign: "center", marginBottom: 30 },
  label: { color: "#D4AF37", fontWeight: "800", marginBottom: 6 },
  input: {
    backgroundColor: "#1B1B1B",
    color: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  info: { color: "#AAA", marginBottom: 14, textAlign: "center" },
  button: { backgroundColor: "#D4AF37", padding: 16, borderRadius: 14, marginTop: 8 },
  disabled: { opacity: 0.6 },
  buttonText: { textAlign: "center", fontWeight: "900", color: "#111" },
  backText: { color: "#D4AF37", textAlign: "center", marginTop: 18, fontWeight: "800" },
});