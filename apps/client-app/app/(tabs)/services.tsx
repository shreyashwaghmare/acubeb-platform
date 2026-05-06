import { ScrollView, Text, View, StyleSheet, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import Animated, { FadeInDown, FadeInRight, LinearTransition, FadeIn } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get("window");

// Professional Service Taxonomy - 2026 Level
const SERVICES = [
  { id: "1", name: "Structural Audit", icon: "🏛️", desc: "Safety, stability & health assessment", tag: "AUDIT" },
  { id: "2", name: "NABL Material Testing", icon: "🧪", desc: "ISO/IEC 17025 certified analysis", tag: "CERTIFIED" },
  { id: "3", name: "Concrete Testing", icon: "🧱", desc: "Compressive strength & NDT analysis", tag: "CORE" },
  { id: "4", name: "Soil Testing", icon: "🌱", desc: "Geotechnical strata & SBC reports", tag: "GEOTECH" },
  { id: "5", name: "Bitumen / Road Testing", icon: "🛣️", desc: "Pavement quality & mix design", tag: "INFRA" },
  { id: "6", name: "Steel / TMT Testing", icon: "🏗️", desc: "Tensile, bend & chemical verification", tag: "MATERIAL" },
  { id: "7", name: "Project Management", icon: "📋", desc: "Strategic PMC & site supervision", tag: "PMC" },
  { id: "8", name: "DPR & Bridge Consultancy", icon: "🌉", desc: "Feasibility & structural consultancy", tag: "DESIGN" },
];

export default function ServicesScreen() {
  const [search, setSearch] = useState("");

  // Safer Search Logic: Accounts for whitespace and casing
  const filteredServices = SERVICES.filter(s => {
    const query = search.trim().toLowerCase();
    return s.name.toLowerCase().includes(query) || s.tag.toLowerCase().includes(query);
  });

  const handlePress = (serviceName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/apply-service",
      params: { service: serviceName },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ENHANCED HEADER */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.header}
        >
          <Text style={styles.metaLabel}>ENGINEERING SERVICES</Text>
          <Text style={styles.heading}>Service Hub</Text>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search services or testing types..."
              placeholderTextColor="#444"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />
          </View>
        </Animated.View>

        {/* EMPTY STATE HANDLING WITH QUICK CHIPS */}
        {filteredServices.length === 0 ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.emptyContainer}
          >
            <View style={styles.emptyIconWrapper}>
              <Text style={styles.emptyIcon}>🔍</Text>
            </View>

            <Text style={styles.emptyTitle}>No Services Found</Text>
            <Text style={styles.emptySub}>
              {`We couldn't find anything matching "${search}"`}
            </Text>

            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionLabel}>QUICK SEARCH:</Text>
              <View style={styles.chipRow}>
                {["Material", "Road", "Audit"].map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={styles.suggestionChip}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSearch(term);
                    }}
                  >
                    <Text style={styles.suggestionChipText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.resetBtn}
            >
              <Text style={styles.resetText}>Reset Catalog</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.grid}>
            {filteredServices.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(index * 40).springify()}
                layout={LinearTransition.springify()}
                style={styles.cardWrapper}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.card}
                  onPress={() => handlePress(item.name)}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.iconText}>{item.icon}</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  </View>

                  <View style={styles.contentArea}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.desc}>{item.desc}</Text>
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.applyText}>Initiate Request</Text>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808", paddingHorizontal: 18 },
  
  // Header Style
  header: { marginTop: 60, marginBottom: 20 },
  metaLabel: { color: "#555", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  heading: { color: "#D4AF37", fontSize: 32, fontWeight: "900", marginTop: 5 },
  
  searchContainer: { 
    backgroundColor: "#121212", 
    height: 52, 
    borderRadius: 16, 
    marginTop: 22, 
    paddingHorizontal: 16, 
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  searchInput: { color: "#FFF", fontSize: 14, flex: 1, fontWeight: "500" },

  // Empty State Logic
  emptyContainer: { marginTop: 60, alignItems: 'center', paddingHorizontal: 30 },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A'
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  emptySub: { color: "#555", fontSize: 14, textAlign: 'center', marginTop: 8 },

  suggestionBox: { marginTop: 30, alignItems: 'center', width: '100%' },
  suggestionLabel: { color: '#444', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
  chipRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  suggestionChip: { 
    backgroundColor: '#161616', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#222' 
  },
  suggestionChipText: { color: '#D4AF37', fontSize: 12, fontWeight: '700' },

  resetBtn: { 
    marginTop: 40, 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 16, 
    backgroundColor: "#D4AF37",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  resetText: { color: "#000", fontWeight: "900", fontSize: 14, textTransform: 'uppercase' },

  // Grid & Cards
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cardWrapper: { width: "48%", marginBottom: 15 },
  card: { 
    backgroundColor: "#111", 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: "#1A1A1A",
    minHeight: 195,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#1A1A1A", justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  iconText: { fontSize: 22 },

  tag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: '#D4AF3710', borderWidth: 1, borderColor: '#D4AF3720' },
  tagText: { color: '#D4AF37', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },

  contentArea: { marginTop: 15 },
  title: { color: "#FFF", fontSize: 15, fontWeight: "800", lineHeight: 20 },
  desc: { color: "#555", fontSize: 11, fontWeight: "600", marginTop: 6, lineHeight: 15 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  applyText: { color: "#D4AF37", fontSize: 10, fontWeight: "900", textTransform: 'uppercase' },
  arrow: { color: "#D4AF37", fontSize: 14 }
});