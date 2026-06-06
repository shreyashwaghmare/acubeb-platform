import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

export default function EvidenceTab({
  selectedPhoto,
  uploadingPhoto,
  onTakePhoto,
  onPickPhoto,
  onUploadPhoto,
}: {
  selectedPhoto: string | null;
  uploadingPhoto: boolean;
  onTakePhoto: () => void;
  onPickPhoto: () => void;
  onUploadPhoto: () => void;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>PHOTO EVIDENCE</Text>

      <View style={styles.photoActionRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={onTakePhoto}>
          <Ionicons name="camera-outline" size={18} color="#000" />
          <Text style={styles.photoBtnText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.photoBtn} onPress={onPickPhoto}>
          <Ionicons name="image-outline" size={18} color="#000" />
          <Text style={styles.photoBtnText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {selectedPhoto && (
        <View style={styles.selectedPhotoBox}>
          <Text style={styles.selectedPhotoText}>
            Photo selected and ready to upload.
          </Text>

          <TouchableOpacity
            style={styles.uploadPhotoBtn}
            onPress={onUploadPhoto}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#000" />
                <Text style={styles.uploadPhotoText}>Upload Evidence</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  photoActionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  photoBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
  },
  selectedPhotoBox: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1C1C1C",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  selectedPhotoText: {
    color: "#CCC",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  uploadPhotoBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadPhotoText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
  },
});