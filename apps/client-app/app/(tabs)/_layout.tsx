import { Tabs } from "expo-router";
import { Home, PlusCircle, ClipboardList, FileText, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, StyleSheet, Text } from "react-native";
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_BOTTOM = Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 20;

  // Premium Icon Component with "Selection Orb"
  const DubaiIcon = ({ Icon, color, focused, label }: any) => {
    const orbStyle = useAnimatedStyle(() => ({
      opacity: withTiming(focused ? 1 : 0),
      transform: [{ scale: withSpring(focused ? 1 : 0.5) }],
    }));

    return (
      <View style={styles.iconContainer}>
        {/* The Indicator Orb - Dubai Luxury Style */}
        <Animated.View style={[styles.activeIndicator, orbStyle]} />
        
        <Icon color={color} size={focused ? 24 : 20} strokeWidth={focused ? 2.5 : 2} />
        
        <Text style={[styles.label, { color: focused ? "#D4AF37" : "#555" }]}>
          {label}
        </Text>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // We use custom labels for better control
        tabBarActiveTintColor: "#D4AF37", // Pure Gold
        tabBarInactiveTintColor: "#555",
        
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: TAB_BAR_BOTTOM,
          height: 80,
          backgroundColor: "#0F0F0F", 
          borderRadius: 28,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          
          // The "Dubai Shadow" - Multiple layers for depth
          borderWidth: 1.5,
          borderColor: "rgba(212, 175, 55, 0.2)", // Subtle Gold frame
          shadowColor: "#D4AF37",
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 15,
        },
        sceneStyle: { backgroundColor: "#080808" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: (props) => <DubaiIcon Icon={Home} label="HOME" {...props} />,
        }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
      />

      <Tabs.Screen
        name="services"
        options={{
          tabBarIcon: (props) => (
            <View style={styles.centerActionWrapper}>
               <View style={[styles.centerAction, props.focused && styles.centerActive]}>
                  <PlusCircle color={props.focused ? "#000" : "#D4AF37"} size={28} />
               </View>
               <Text style={[styles.label, { color: props.focused ? "#D4AF37" : "#555", marginTop: 4 }]}>NEW</Text>
            </View>
          ),
        }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) }}
      />

      <Tabs.Screen
        name="requests"
        options={{
          tabBarIcon: (props) => <DubaiIcon Icon={ClipboardList} label="REQUESTS" {...props} />,
        }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: (props) => <DubaiIcon Icon={FileText} label="REPORTS" {...props} />,
        }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: (props) => <DubaiIcon Icon={User} label="PROFILE" {...props} />,
        }}
        listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  // Selection Orb - Gives immediate visual feedback
  activeIndicator: {
    position: 'absolute',
    top: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D4AF37",
    shadowColor: "#D4AF37",
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  label: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 6,
    textAlign: 'center',
  },
  // Center Action - The "Jewel" of the bar
  centerActionWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  centerAction: {
    width: 50,
    height: 50,
    borderRadius: 18, // Squircle shape is more modern than a circle
    backgroundColor: "#1A1A1A",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  centerActive: {
    backgroundColor: "#D4AF37",
    transform: [{ scale: 1.1 }],
  }
});