import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useAppContext } from "../context/AppContext";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { usePremiumToast } from "../components/PremiumToast";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { Ionicons } from "@expo/vector-icons";

// CORRECTED: Moved outside to prevent re-mounting and losing keyboard focus
const InputField = ({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, multiline }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      placeholder={placeholder}
      placeholderTextColor="#444"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || "default"}
      autoCapitalize={autoCapitalize || "none"}
      multiline={multiline}
      // Dubai 2026 UX: Disable annoying auto-correct for technical fields
      autoCorrect={false}
      spellCheck={false}
    />
  </View>
);

export default function EditProfile() {
  const { client, updateClient } = useAppContext();
  const { user } = useAuth();
  const [form, setForm] = useState(client || {}); // Guard against null client
  const [loading, setLoading] = useState(false);
  const { showToast } = usePremiumToast();

  const save = async () => {
    if (!user?.token) {
      showToast("Session expired. Please login again.", "error");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await api.updateProfile(user.token, {
        name: form.name,
        email: form.email,
        gst: form.gst,
        address: form.address,
      });

      if (res.success) {
        updateClient(res.data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Profile credentials synchronized", "success");
        setTimeout(() => {
          router.back();
        }, 800);
      } else {
        showToast(res.message || "Synchronization failed", "error");
      }
    } catch (error) {
      showToast("System error during update", "error");
      console.error("Edit Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER SECTION */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.headerArea}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.metaLabel}>ACCOUNT SETTINGS</Text>
          <Text style={styles.heading}>Update Profile</Text>
        </Animated.View>

        {/* SECURE READ-ONLY FIELD */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.lockedCard}>
          <Ionicons name="lock-closed" size={14} color="#D4AF37" />
          <View style={styles.lockedTextContent}>
            <Text style={styles.lockedLabel}>VERIFIED MOBILE NUMBER</Text>
            <Text style={styles.lockedValue}>{form.mobile || "N/A"}</Text>
          </View>
          <Text style={styles.lockInfo}>Contact support to change</Text>
        </Animated.View>

        {/* EDITABLE FIELDS */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.formSection}>
          <InputField 
            label="CLIENT / COMPANY NAME"
            value={form.name}
            onChangeText={(v: string) => setForm({ ...form, name: v })}
            placeholder="Legal Entity Name"
          />

          <InputField 
            label="EMAIL ADDRESS"
            value={form.email}
            onChangeText={(v: string) => setForm({ ...form, email: v })}
            placeholder="example@corporate.com"
            keyboardType="email-address"
          />

          <InputField 
            label="GST IDENTIFICATION"
            value={form.gst}
            onChangeText={(v: string) => setForm({ ...form, gst: v })}
            placeholder="22AAAAA0000A1Z5"
            autoCapitalize="characters"
          />

          <InputField 
            label="REGISTERED ADDRESS"
            value={form.address}
            onChangeText={(v: string) => setForm({ ...form, address: v })}
            placeholder="Full business address"
            multiline
          />
        </Animated.View>

        {/* ACTION BUTTON */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={save}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>SAVE CONFIGURATION</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Discard Changes</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },

  headerArea: { marginTop: 60, marginBottom: 25 },
  backBtn: { marginBottom: 15, width: 40, height: 40, borderRadius: 12, backgroundColor: "#111", justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: "#1A1A1A" },
  metaLabel: { color: "#555", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  heading: { color: "#D4AF37", fontSize: 28, fontWeight: "900", marginTop: 4 },

  lockedCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: "#111", 
    padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.3)", 
    marginBottom: 25, borderStyle: 'dashed' 
  },
  lockedTextContent: { flex: 1, marginLeft: 12 },
  lockedLabel: { color: "#D4AF37", fontSize: 8, fontWeight: "900", letterSpacing: 1, opacity: 0.6 },
  lockedValue: { color: "#FFF", fontSize: 14, fontWeight: "700", marginTop: 2 },
  lockInfo: { color: "#555", fontSize: 8, fontWeight: "700" },

  formSection: { marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: "#D4AF37", fontSize: 9, fontWeight: "900", letterSpacing: 1, marginBottom: 10, marginLeft: 5 },
  input: {
    backgroundColor: "#111",
    color: "#FFF",
    padding: 18,
    borderRadius: 20,
    fontSize: 15,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  textArea: { height: 110, textAlignVertical: "top" },

  saveButton: { 
    backgroundColor: "#D4AF37", height: 60, borderRadius: 20, 
    justifyContent: "center", alignItems: "center",
    shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.2, shadowRadius: 15 
  },
  disabledButton: { opacity: 0.5 },
  saveButtonText: { color: "#000", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  
  cancelBtn: { marginTop: 15, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: "#444", fontSize: 13, fontWeight: "700" }
});