import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { api } from "../services/api";

export default function LoginScreen() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const { login } = useAuth();

  const sendOtp = () => {
    if (mobile.length < 10) return;
    setStep(2);
  };

  const verifyOtp = async () => {
  const res = await api.login(mobile);

  if (res.success) {
    await login(mobile, res.token, res.user?.name || "Client");
router.replace("/(tabs)"); // temp (we’ll improve next)
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>A CUBE B</Text>
      <Text style={styles.subtitle}>Smart Lab Platform</Text>

      {step === 1 ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
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
          <TextInput
            style={styles.input}
            placeholder="Enter OTP (1234)"
            placeholderTextColor="#777"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            <Text style={styles.buttonText}>Verify & Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", justifyContent: "center", padding: 20 },
  logo: { color: "#D4AF37", fontSize: 32, fontWeight: "900", textAlign: "center" },
  subtitle: { color: "#AAA", textAlign: "center", marginBottom: 30 },
  input: {
    backgroundColor: "#1B1B1B",
    color: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  button: { backgroundColor: "#D4AF37", padding: 16, borderRadius: 14 },
  buttonText: { textAlign: "center", fontWeight: "900", color: "#111" },
});