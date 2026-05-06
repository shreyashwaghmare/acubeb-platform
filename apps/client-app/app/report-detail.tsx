import { useLocalSearchParams, router } from "expo-router";
import { ScrollView, Text, View, TouchableOpacity, StyleSheet, Share, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import * as Linking from "expo-linking";
import * as Haptics from 'expo-haptics';
import QRCode from "react-native-qrcode-svg";
import { usePremiumToast } from "../components/PremiumToast";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from "react-native-reanimated";

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { showToast } = usePremiumToast();
  const [report, setReport] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Animation for the "Certified" Pulse
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.1, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true);
  }, []);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: pulse.value,
  }));

  useEffect(() => {
    const fetchReport = async () => {
      if (!user?.token) return;
      try {
        const res = await api.getReportById(id, user.token);
        if (res.success) setReport(res.data);
      } catch (e) { console.log("Fetch error", e); }
    };
    fetchReport();
  }, [id]);

  const handleVerify = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsVerifying(true);
    // Simulating 2026 Blockchain/Cloud verification delay
    setTimeout(() => {
      setIsVerifying(false);
      showToast("Report verified in A Cube B secure database", "success");
    }, 1500);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `A-Cube-B Digital Report ${report.reportNo} for ${report.project}. Verify at: ${report.pdfUrl}`,
      });
    } catch (error) { console.log(error); }
  };

  if (!report) return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color="#D4AF37" />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      
      {/* TOP NAVIGATION OVERLAY */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.navAction}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.navAction}>Share Asset</Text>
        </TouchableOpacity>
      </View>

      {/* HERO SECTION - THE "DOSSIER" LOOK */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.hero}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.idLabel}>OFFICIAL CERTIFICATE</Text>
            <Text style={styles.reportNo}>{report.reportNo}</Text>
          </View>
          <Animated.View style={[styles.trustSeal, animatedPulse]}>
            <Text style={styles.sealText}>✓</Text>
          </Animated.View>
        </View>
        
        <Text style={styles.serviceTitle}>{report.service}</Text>
        <View style={styles.statusPill}>
          <View style={[styles.dot, { backgroundColor: getStatusColor(report.status) }]} />
          <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
        </View>
      </Animated.View>

      {/* INTERACTIVE SPECS */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.specGrid}>
        <SpecBox label="Project Name" value={report.project} />
        <SpecBox label="Issue Authority" value="A Cube B Engineering" />
        <SpecBox label="Valid Until" value="Indefinite (Digital Record)" />
        <SpecBox label="Timestamp" value={report.issueDate} />
      </Animated.View>

      {/* SECURE QR BOX */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.qrSection}>
        <View style={styles.qrWrapper}>
          <QRCode value={report.verificationCode || "ACUBEB"} size={160} color="#000" backgroundColor="transparent" />
        </View>
        <Text style={styles.qrHint}>DYNAMIC AUTHENTICATION QR</Text>
        <Text style={styles.qrSub}>This code verifies the report record stored in A Cube B secure database.</Text>
      </Animated.View>

      {/* FOOTER ACTIONS */}
      <View style={styles.actionArea}>
        <TouchableOpacity style={styles.mainBtn} onPress={handleVerify} disabled={isVerifying}>
          {isVerifying ? <ActivityIndicator color="#000" /> : <Text style={styles.mainBtnText}>VERIFY INTEGRITY</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
           style={styles.secondaryBtn} 
           onPress={() => report.pdfUrl ? Linking.openURL(report.pdfUrl) : showToast("Generating PDF...", "info")}
        >
          <Text style={styles.secondaryBtnText}>ACCESS PDF CLOUD</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

// Sub-component for Bento-style detail boxes
function SpecBox({ label, value }: any) {
  return (
    <View style={styles.specBox}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

function getStatusColor(status: string) {
  if (status === "Completed") return "#4CAF50";
  if (status === "Pending") return "#FF9800";
  return "#D4AF37";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808", padding: 20 },
  
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 20 },
  navAction: { color: "#D4AF37", fontWeight: "700", fontSize: 14 },

  hero: { backgroundColor: "#121212", borderRadius: 30, padding: 25, borderWidth: 1, borderColor: "#1A1A1A" },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  idLabel: { color: "#555", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  reportNo: { color: "#D4AF37", fontSize: 22, fontWeight: "900", marginTop: 4 },
  trustSeal: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' },
  sealText: { color: '#D4AF37', fontWeight: '900', fontSize: 18 },
  
  serviceTitle: { color: "#FFF", fontSize: 20, fontWeight: "800", marginTop: 15 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: '#1A1A1A' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  statusText: { color: "#FFF", fontSize: 10, fontWeight: "900", letterSpacing: 1 },

  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 15 },
  specBox: { width: '48%', backgroundColor: '#121212', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1A1A1A' },
  specLabel: { color: '#555', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  specValue: { color: '#CCC', fontSize: 13, fontWeight: '700', marginTop: 4 },

  qrSection: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, marginTop: 15, alignItems: 'center' },
  qrWrapper: { padding: 10, backgroundColor: '#FFF' },
  qrHint: { color: '#000', fontSize: 11, fontWeight: '900', marginTop: 15, letterSpacing: 1 },
  qrSub: { color: '#666', fontSize: 10, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },

  actionArea: { marginTop: 25, gap: 12 },
  mainBtn: { backgroundColor: "#D4AF37", height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  mainBtnText: { color: "#000", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  secondaryBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D4AF37' },
  secondaryBtnText: { color: "#D4AF37", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
});