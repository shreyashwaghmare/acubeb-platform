import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { api } from "../services/api";
import { usePremiumToast } from "../components/PremiumToast";

export default function LoginScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { showToast } = usePremiumToast();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const sendOtp = () => {
    if (mode === "register" && !name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (mobile.length < 10) {
      showToast("Enter a valid mobile number", "error");
      return;
    }

    setStep(2);
  };

  const verifyOtp = async () => {
    if (otp !== "1234") {
      showToast("Invalid OTP (use 1234)", "error");
      return;
    }

    try {
      setLoading(true);

      let res;

      if (mode === "register") {
        res = await api.register(name, mobile);
      } else {
        res = await api.login(mobile);
      }

      if (res.success) {
        showToast("Welcome to A Cube B", "success");
        await login(res.user.mobile, res.token, res.user.name);
        setTimeout(() => {
    router.replace("/(tabs)");
  }, 500);
      } else {
        showToast(res.message || "Something went wrong", "error");
      }
    } catch (error:any) {
      showToast(error.message || "Unexpected error occurred", "error");
  console.log("🔥 Full Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>A CUBE B</Text>
      <Text style={styles.subtitle}>Smart Lab Platform</Text>

      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.tab, mode === "login" && styles.activeTab]}
          onPress={() => {
            setMode("login");
            setStep(1);
          }}
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, mode === "register" && styles.activeTab]}
          onPress={() => {
            setMode("register");
            setStep(1);
          }}
        >
          <Text style={styles.tabText}>Register</Text>
        </TouchableOpacity>
      </View>

      {step === 1 ? (
        <>
          {mode === "register" && (
            <>
              <Text style={styles.label}>Name / Company</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                placeholderTextColor="#777"
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile"
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
              {loading ? "Processing..." : "Verify"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.back}>Change Details</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    color: "#D4AF37",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#AAA",
    textAlign: "center",
    marginBottom: 30,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#1B1B1B",
    borderRadius: 14,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#D4AF37",
    borderRadius: 14,
  },
  tabText: {
    color: "#FFF",
    fontWeight: "800",
  },
  label: {
    color: "#D4AF37",
    fontWeight: "800",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1B1B1B",
    color: "#FFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  info: {
    color: "#AAA",
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#D4AF37",
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "900",
    color: "#111",
  },
  back: {
    color: "#D4AF37",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "800",
  },
});