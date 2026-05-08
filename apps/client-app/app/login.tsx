import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
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

  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const { login } = useAuth();

  const formatMobile = (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.startsWith("91") ? `+${clean}` : `+91${clean}`;
  };

  const sendOtp = async () => {
    try {
      if (mode === "register" && !name.trim()) {
        showToast("Please enter your name", "error");
        return;
      }

      const cleanMobile = mobile.replace(/\D/g, "");

      if (cleanMobile.length !== 10) {
        showToast("Enter valid 10 digit mobile number", "error");
        return;
      }

      setLoading(true);

      const phoneNumber = formatMobile(cleanMobile);
      console.log("Sending OTP to:", phoneNumber);

      const result = await auth().signInWithPhoneNumber(phoneNumber);

      setConfirmation(result);
      setStep(2);
      showToast("OTP sent successfully", "success");
    } catch (error: any) {
      console.log("SEND OTP ERROR:", error);
      showToast(error?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!confirmation) {
        showToast("Please request OTP again", "error");
        return;
      }

      if (!otp.trim()) {
        showToast("Please enter OTP", "error");
        return;
      }

      setLoading(true);

      const credential = await confirmation.confirm(otp.trim());

      if (!credential?.user) {
        showToast("OTP verification failed", "error");
        return;
      }

      const firebaseToken = await credential.user.getIdToken();

      const cleanMobile = mobile.replace(/\D/g, "");

      const res = await api.firebaseLogin({
        firebaseToken,
        mobile: cleanMobile,
        email: credential.user.email || "",
        name: mode === "register" ? name.trim() : credential.user.displayName || "",
        profileImage: credential.user.photoURL || "",
        provider: "phone",
      });

      if (res?.success) {
        showToast("Welcome to A Cube B", "success");

        await login(res.user.mobile, res.token, res.user.name);

        setTimeout(() => {
          router.replace("/(tabs)");
        }, 500);
      } else {
        showToast(res?.message || "Login failed", "error");
      }
    } catch (error: any) {
      console.log("VERIFY OTP ERROR:", error);
      showToast(error?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>A CUBE B</Text>
      <Text style={styles.subtitle}>Smart Lab Platform</Text>

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.tab, mode === "login" && styles.activeTab]}
          onPress={() => {
            setMode("login");
            setStep(1);
            setOtp("");
            setConfirmation(null);
          }}
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, mode === "register" && styles.activeTab]}
          onPress={() => {
            setMode("register");
            setStep(1);
            setOtp("");
            setConfirmation(null);
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
            placeholder="Enter 10 digit mobile"
            placeholderTextColor="#777"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            onChangeText={setMobile}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabled]}
            onPress={sendOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.info}>OTP sent to +91 {mobile}</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="#777"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabled]}
            onPress={verifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setStep(1);
              setOtp("");
              setConfirmation(null);
            }}
          >
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