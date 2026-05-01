import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useAppContext } from "../context/AppContext";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Alert } from "react-native";

export default function EditProfile() {
  const { client, updateClient } = useAppContext();
  const { user } = useAuth();
  const [form, setForm] = useState(client);

  const save = async () => {
  if (!user?.token) {
    Alert.alert("Session expired. Please login again.");
    return;
  }

  try {
    const res = await api.updateProfile(user.token, {
      name: form.name,
      email: form.email,
      gst: form.gst,
      address: form.address,
    });

    if (res.success) {
      updateClient(res.data); // update UI instantly
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } else {
      Alert.alert("Error", "Failed to update profile");
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Something went wrong");
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.heading}>Edit Profile</Text>

      <Text style={styles.label}>Client / Company Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter client or company name"
        placeholderTextColor="#777"
        value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })}
      />

      <Text style={styles.label}>Mobile Number</Text>
      <View style={styles.disabledInput}>
  <Text style={styles.disabledText}>{form.mobile}</Text>
</View>

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email address"
        placeholderTextColor="#777"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email || ""}
        onChangeText={(v) => setForm({ ...form, email: v })}
      />

      <Text style={styles.label}>GST Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter GST number"
        placeholderTextColor="#777"
        autoCapitalize="characters"
        value={form.gst || ""}
        onChangeText={(v) => setForm({ ...form, gst: v })}
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter full address"
        placeholderTextColor="#777"
        multiline
        value={form.address || ""}
        onChangeText={(v) => setForm({ ...form, address: v })}
      />

      <TouchableOpacity style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 18,
  },
  heading: {
    color: "#D4AF37",
    fontSize: 26,
    fontWeight: "900",
    marginVertical: 20,
  },
  label: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#1B1B1B",
    color: "#FFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#D4AF37",
    padding: 16,
    borderRadius: 14,
    marginTop: 18,
  },
  buttonText: {
    color: "#111",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
  disabledInput: {
  backgroundColor: "#1B1B1B",
  padding: 15,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#333",
  marginBottom: 10,
},

disabledText: {
  color: "#888",
  fontSize: 15,
},
});