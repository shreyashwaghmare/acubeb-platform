import { useState, useEffect, useRef } from "react";
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
  const { showToast } = usePremiumToast();
  const { login } = useAuth();

  // Unified State Variables
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isNewUser, setIsNewUser] = useState(false);

  // Isolated Loading Flags to prevent UI bleeding
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Tracks the last successfully sent number to handle smart back-routing behavior
  const [lastSentMobile, setLastSentMobile] = useState("");

  // Cooldown Tracking System
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<any>(null);

  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  // Countdown background mechanism worker
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const formatMobile = (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.startsWith("91") ? `+${clean}` : `+91${clean}`;
  };

  const sendOtp = async () => {
    const cleanMobile = mobile.replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      showToast("Enter valid 10 digit mobile number", "error");
      return;
    }

    // Smart Guard: If session is warm and number hasn't changed, restore screen step instantly
    if (confirmation && countdown > 0 && cleanMobile === lastSentMobile) {
      console.log("🔄 Active verification session found. Restoring step 2 view state.");
      setSendingOtp(true);
      try {
        const userExists = await api.checkUserExists(cleanMobile);
        setIsNewUser(!userExists);
        setStep(2);
        return;
      } catch (err) {
        // Fallback gracefully if endpoint drops
      } finally {
        setSendingOtp(false);
      }
    }

    try {
      setSendingOtp(true);
      const phoneNumber = formatMobile(cleanMobile);
      console.log("Sending OTP to:", phoneNumber);

      // 1. Fire Firebase Handshake Request
      const result = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirmation(result);
      setLastSentMobile(cleanMobile);

      // 2. Query your database to check if registration details are needed
      const userExists = await api.checkUserExists(cleanMobile);
      setIsNewUser(!userExists);

      // 3. Move forward seamlessly
      setStep(2);
      setCountdown(60); // Engage 1-minute safety lock
      showToast("OTP sent successfully", "success");
    } catch (error: any) {
      console.log("SEND OTP ERROR:", error);
      showToast(error?.message || "Failed to send OTP", "error");
    } finally {
      setSendingOtp(false);
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

      // Guard check: Require profile setup fields ONLY if database returned unknown user
      if (isNewUser && !name.trim()) {
        showToast("Please enter your name / company to register", "error");
        return;
      }

      setVerifyingOtp(true);

      const credential = await confirmation.confirm(otp.trim());

      if (!credential?.user) {
        showToast("OTP verification failed", "error");
        return;
      }

      const firebaseToken = await credential.user.getIdToken();
      const cleanMobile = mobile.replace(/\D/g, "");

      // Execute unified auth routing structure
      const res = await api.firebaseLogin({
        firebaseToken,
        mobile: cleanMobile,
        email: credential.user.email || "",
        name: isNewUser ? name.trim() : credential.user.displayName || "Client",
        profileImage: credential.user.photoURL || "",
        provider: "phone",
      });

      if (res?.success) {
        showToast("Welcome to A Cube B", "success");
        await login(res.user.mobile, res.token, res.user.name);
        
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 500);
      }else if (
        !res?.success && 
        (res?.message?.toLowerCase().includes("duplicate") || 
         res?.message?.toLowerCase().includes("constraint") || 
         res?.message?.toLowerCase().includes("violation"))
      ) {
        console.log("🔄 Account already exists in Railway DB. Executing automatic fallback login path.");
        
        // Since Firebase ALREADY verified the SMS OTP, we know the user owns this device.
        // We can safely request a clean login token directly from your backend login route.
        const loginRes = await api.login(cleanMobile);
        
        if (loginRes?.success) {
          showToast("Welcome back to A Cube B", "success");
          await login(loginRes.user.mobile, loginRes.token, loginRes.user.name || "Client");
          
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 500);
        } else {
          showToast(loginRes?.message || "Session conflict. Please try again.", "error");
        }
      }
       else {
        showToast(res?.message || "Authentication failed", "error");
      }
    } catch (error: any) {
      console.log("VERIFY OTP ERROR:", error);
      showToast(error?.message || "Invalid OTP", "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Determine if main step 1 action button should lock up safely
  const isStep1CleanMobile = mobile.replace(/\D/g, "");
  const isSessionWarm = confirmation && countdown > 0 && isStep1CleanMobile === lastSentMobile;
  const isStep1ButtonDisabled = sendingOtp;

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>A CUBE B</Text>
      <Text style={styles.subtitle}>Smart Lab Platform</Text>

      {step === 1 ? (
        <View style={styles.formCard}>
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
            style={[styles.button, isStep1ButtonDisabled && styles.disabled]}
            onPress={sendOtp}
            disabled={isStep1ButtonDisabled}
          >
            <Text style={styles.buttonText}>
              {sendingOtp 
                ? "Sending OTP..." 
                : isSessionWarm
                  ? "Resume Login" // 💡 Guide them back smoothly!
                  : "Get Started"
              }
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.info}>OTP sent to +91 {mobile}</Text>

          {/* DYNAMIC REGISTRATION INJECTION: Only loads if user profile is absent */}
          {isNewUser && (
            <>
              <Text style={styles.label}>Name / Company</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name to register"
                placeholderTextColor="#777"
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="#777"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity
            style={[styles.button, verifyingOtp && styles.disabled]}
            onPress={verifyOtp}
            disabled={verifyingOtp}
          >
            <Text style={styles.buttonText}>
              {verifyingOtp ? "Verifying..." : "Verify & Login"}
            </Text>
          </TouchableOpacity>

          {/* Inline Cooldown Timer Action Block */}
          <TouchableOpacity
            style={[
              styles.resendButton,
              (countdown > 0 || sendingOtp || verifyingOtp) && styles.resendDisabled,
            ]}
            onPress={sendOtp}
            disabled={countdown > 0 || sendingOtp || verifyingOtp}
          >
            <Text style={styles.resendText}>
              {sendingOtp 
                ? "Sending..." 
                : countdown > 0 
                  ? `Resend OTP in ${countdown}s` 
                  : "Resend OTP"
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setStep(1);
              setOtp("");
              // We do NOT clear countdown or confirmation here, allowing 
              // the guard clause to work if they type the same number back in.
            }}
            disabled={sendingOtp || verifyingOtp}
          >
            <Text style={styles.back}>Change Mobile Number</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 40,
  },
  formCard: {
    width: "100%",
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  info: {
    color: "#AAA",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#D4AF37",
    padding: 15,
    borderRadius: 14,
    marginTop: 5,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "900",
    color: "#111",
    fontSize: 16,
  },
  resendButton: {
    marginTop: 15,
    padding: 10,
    alignItems: "center",
  },
  resendDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: "#D4AF37",
    fontWeight: "800",
  },
  back: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});