import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { services } from "../../data/mockData";
import { router } from "expo-router";
export default function ServicesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
      <Text style={styles.heading}>Apply New Service</Text>

      {services.map((service, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/apply-service",
              params: { service },
            })
          }
        >
          <Text style={styles.title}>{service}</Text>
          <Text style={styles.text}>Create new request</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 18 },
  heading: { color: "#D4AF37", fontSize: 24, fontWeight: "900", marginVertical: 20 },
  card: { backgroundColor: "#1B1B1B", padding: 18, borderRadius: 16, marginBottom: 12 },
  title: { color: "#FFF", fontSize: 17, fontWeight: "800" },
  text: { color: "#AAA", marginTop: 6 },
});