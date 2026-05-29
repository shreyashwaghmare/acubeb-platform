import { ScrollView, Text, View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import Animated, { FadeInDown, FadeInRight, LinearTransition } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';

import serviceData from "../../data/services.json";

export default function ServicesScreen() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = serviceData.categories.filter(cat => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const matchCat = cat.name.toLowerCase().includes(query) || cat.tag.toLowerCase().includes(query);
    const matchTests = cat.subCategories.some(sub => 
      sub.name.toLowerCase().includes(query) || 
      sub.tests.some(t => t.name.toLowerCase().includes(query) || t.code.toLowerCase().includes(query))
    );

    return matchCat || matchTests;
  });

  const handleTestSelection = (testName: string, code: string, formLayout: string, unit: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/apply-service",
      params: { 
        service: testName,
        code: code,
        formLayout: formLayout,
        unit: unit
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.metaLabel}>MoRT&H 5TH REVISION TAXONOMY</Text>
          <Text style={styles.heading}>Service Hub</Text>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search e.g. VG-40, DBM, PQC, IS 516..."
              placeholderTextColor="#444"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />
          </View>
        </Animated.View>

        {filteredCategories.map((category, idx) => {
          const isExpanded = activeCategory === category.id || search.trim().length > 0;

          return (
            <Animated.View 
              key={category.id}
              entering={FadeInRight.delay(idx * 40).springify()}
              layout={LinearTransition.springify()}
              style={styles.categoryCard}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveCategory(activeCategory === category.id ? null : category.id);
                }}
                style={styles.categoryHeader}
              >
                <View style={styles.headerLeft}>
                  <Text style={styles.catIcon}>{category.icon || "🧱"}</Text>
                  <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text style={styles.catTitle}>{category.name}</Text>
                    <Text style={styles.catDesc} numberOfLines={1}>{category.desc}</Text>
                  </View>
                </View>
                <View style={styles.headerRight}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{category.tag}</Text>
                  </View>
                  <Text style={styles.arrowIcon}>{isExpanded ? "▲" : "▼"}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  {category.subCategories.map(sub => (
                    <View key={sub.id} style={styles.subBlock}>
                      <Text style={styles.subBlockTitle}>{sub.name.toUpperCase()}</Text>
                      
                      {sub.tests.map(test => (
                        <TouchableOpacity
                          key={test.id}
                          style={styles.testItemRow}
                          onPress={() => handleTestSelection(test.name, test.code, test.formLayout, test.unit)}
                        >
                          <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.testName}>{test.name}</Text>
                            <Text style={styles.testCode}>{test.code}</Text>
                          </View>
                          <View style={styles.actionChip}>
                            <Text style={styles.actionChipText}>Select →</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808", paddingHorizontal: 16 },
  header: { marginTop: 60, marginBottom: 15 },
  metaLabel: { color: "#555", fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  heading: { color: "#D4AF37", fontSize: 32, fontWeight: "900", marginTop: 4 },
  searchContainer: { backgroundColor: "#111", height: 52, borderRadius: 16, marginTop: 15, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1, borderColor: '#1A1A1A' },
  searchInput: { color: "#FFF", fontSize: 14, fontWeight: "500" },

  categoryCard: { backgroundColor: "#111", borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: "#1A1A1A", overflow: 'hidden' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  catIcon: { fontSize: 24 },
  catTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  catDesc: { color: "#555", fontSize: 11, marginTop: 3, fontWeight: "600" },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { backgroundColor: '#D4AF3710', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#D4AF3720' },
  badgeText: { color: '#D4AF37', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  arrowIcon: { color: "#D4AF37", fontSize: 10, width: 12, textAlign: 'center' },

  expandedContent: { backgroundColor: "#0C0C0C", paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: "#161616" },
  subBlock: { marginTop: 16 },
  subBlockTitle: { color: "#444", fontSize: 9, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  testItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#141414" },
  testName: { color: "#EEE", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  testCode: { color: "#D4AF37", fontSize: 10, fontWeight: "600", marginTop: 3 },
  actionChip: { backgroundColor: "#D4AF37", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actionChipText: { color: "#000", fontSize: 10, fontWeight: "900" }
});