import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { usePremiumToast } from "../components/PremiumToast";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import TaskHeader from "../components/task-detail/TaskHeader";
import TaskTabs, { TaskTabKey } from "../components/task-detail/TaskTabs";
import ClientTab from "../components/task-detail/ClientTab";
import WorkflowTab from "../components/task-detail/WorkflowTab";
import EvidenceTab from "../components/task-detail/EvidenceTab";
import TimelineTab from "../components/task-detail/TimelineTab";

type TaskDetail = {
  id: string;
  request_no: string;
  service: string;
  project: string;
  site: string;
  contact_person?: string;
  sample_qty?: string;
  remarks?: string;
  status: string;
  client_name?: string;
  client_mobile?: string;
  created_at?: string;
};

type HistoryItem = {
  id: string;
  request_id: string;
  status: string;
  updated_by?: string;
  remarks?: string;
  created_at?: string;
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const requestId = String(id);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const { user } = useAuth();
  const { showToast } = usePremiumToast();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskTabKey>("client");
  const loadTaskData = useCallback(async () => {
    if (!user?.token || !requestId) return;

    try {
      setLoading(true);

      const [taskRes, historyRes] = await Promise.all([
        api.getOperatorTaskDetail(user.token, requestId),
        api.getOperatorTaskHistory(user.token, requestId),
      ]);

      if (taskRes.success) {
        setTask(taskRes.data);
      } else {
        showToast(taskRes.message || "Failed to load task", "error");
      }

      if (historyRes.success) {
        const timeline = historyRes.data || [];
        setHistory(timeline);

        const alreadyCheckedIn = timeline.some(
          (item: HistoryItem) => item.status === "SITE_VISIT_STARTED",
        );

        setHasCheckedIn(alreadyCheckedIn);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to sync task details", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.token, requestId]);

  useEffect(() => {
    loadTaskData();
  }, [loadTaskData]);

  const executeStatusMutation = async (targetStatus: string) => {
    if (!user?.token) {
      showToast("Authentication session expired", "error");
      return;
    }

    try {
      setUpdating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const res = await api.mutateRequestStatus(
        user.token,
        requestId,
        targetStatus,
        remarks,
      );

      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(
          `Status updated to ${targetStatus.replaceAll("_", " ")}`,
          "success",
        );
        setRemarks("");
        await loadTaskData();
      } else {
        showToast(res.message || "Mutation rejected by server", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Critical server communication failure", "error");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "Time not available";
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusText = task?.status?.replaceAll("_", " ") || "SYNCING";
  const currentStatus = String(task?.status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  const shouldShowReportUpload = currentStatus === "REPORT_READY";
  if (loading) {
    return (
      <View style={styles.loaderScreen}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loaderText}>Loading task workflow...</Text>
      </View>
    );
  }
  const callClient = () => {
    const phone = task?.client_mobile || task?.contact_person;

    if (!phone) {
      showToast("Client mobile number not available", "error");
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const openMaps = () => {
    if (!task?.site) {
      showToast("Site address not available", "error");
      return;
    }

    const encodedAddress = encodeURIComponent(task.site);
    const url = Platform.select({
      ios: `maps://?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });

    Linking.openURL(url);
  };
  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast("Gallery permission required", "error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedPhoto(result.assets[0].uri);
      showToast("Photo selected", "success");
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      showToast("Camera permission required", "error");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedPhoto(result.assets[0].uri);
      showToast("Photo captured", "success");
    }
  };

  const uploadSelectedPhoto = async () => {
    if (!user?.token || !selectedPhoto) {
      showToast("Select or capture photo first", "error");
      return;
    }

    try {
      setUploadingPhoto(true);

      const res = await api.uploadPhoto(
        user.token,
        requestId,
        selectedPhoto,
        "SITE",
        "Site evidence uploaded by operator",
      );

      if (res.success) {
        showToast("Photo evidence saved", "success");
        setSelectedPhoto(null);
        await loadTaskData();
      } else {
        showToast(res.message || "Photo upload failed", "error");
      }
    } catch (error) {
      showToast("Photo upload failed", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };
  const startSiteVisit = async () => {
    try {
      setCheckingIn(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        showToast("Location permission denied", "error");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      const res = await api.checkIn(
        user!.token,
        requestId,
        latitude,
        longitude,
      );

      if (res.success) {
        setHasCheckedIn(true);
        showToast("Site visit started", "success");

        await loadTaskData();
      } else {
        showToast(res.message, "error");
      }
    } catch (error) {
      showToast("GPS capture failed", "error");
    } finally {
      setCheckingIn(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#D4AF37" />
          <Text style={styles.backText}>Back to Console</Text>
        </TouchableOpacity>

        <TaskHeader task={task} statusText={statusText} />
        <TaskTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "client" && (
          <ClientTab
            task={task}
            hasCheckedIn={hasCheckedIn}
            checkingIn={checkingIn}
            onCallClient={callClient}
            onOpenMaps={openMaps}
            onStartSiteVisit={startSiteVisit}
          />
        )}

        {activeTab === "workflow" && (
          <WorkflowTab
            remarks={remarks}
            setRemarks={setRemarks}
            updating={updating}
            currentStatus={currentStatus}
            shouldShowReportUpload={shouldShowReportUpload}
            requestId={requestId}
            onStatusChange={executeStatusMutation}
          />
        )}

        {activeTab === "evidence" && (
          <EvidenceTab
            selectedPhoto={selectedPhoto}
            uploadingPhoto={uploadingPhoto}
            onTakePhoto={takePhoto}
            onPickPhoto={pickPhoto}
            onUploadPhoto={uploadSelectedPhoto}
          />
        )}

        {activeTab === "timeline" && (
          <TimelineTab history={history} formatDate={formatDate} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080808" },
  scrollContainer: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  loaderScreen: {
    flex: 1,
    backgroundColor: "#080808",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: { color: "#555", marginTop: 12, fontWeight: "700" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  backText: { color: "#D4AF37", fontSize: 14, fontWeight: "700" },
});
