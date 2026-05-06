import { Tabs } from "expo-router";
import {
  Home,
  PlusCircle,
  ClipboardList,
  FileText,
  User,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, StyleSheet, Text } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const GOLD = "#D4AF37";
const DARK = "#0F0F0F";
const BLACK = "#080808";
const MUTED = "#555";

function PremiumTabIcon({
  Icon,
  color,
  focused,
  label,
}: {
  Icon: any;
  color: string;
  focused: boolean;
  label: string;
}) {
  const orbStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: 180 }),
    transform: [{ scale: withSpring(focused ? 1 : 0.5) }],
  }));

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(focused ? -2 : 0) }],
  }));

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[styles.activeIndicator, orbStyle]} />

      <Animated.View style={iconWrapStyle}>
        <Icon
          color={color}
          size={focused ? 24 : 21}
          strokeWidth={focused ? 2.7 : 2}
        />
      </Animated.View>

      <Text style={[styles.label, { color: focused ? GOLD : MUTED }]}>
        {label}
      </Text>
    </View>
  );
}

function CenterTabIcon({
  focused,
}: {
  focused: boolean;
  color: string;
  size: number;
}) {
  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.08 : 1) }],
  }));

  return (
    <View style={styles.centerActionWrapper}>
      <Animated.View
        style={[
          styles.centerAction,
          focused && styles.centerActive,
          centerStyle,
        ]}
      >
        <PlusCircle color={focused ? "#000" : GOLD} size={28} strokeWidth={2.4} />
      </Animated.View>

      <Text style={[styles.label, { color: focused ? GOLD : MUTED, marginTop: 4 }]}>
        NEW
      </Text>
    </View>
  );
}

const hapticLight = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

const hapticHeavy = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottom =
    Platform.OS === "ios" ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 14);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: MUTED,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: BLACK },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: tabBarBottom,
          height: 82,
          backgroundColor: DARK,
          borderRadius: 30,
          borderTopWidth: 0,
          paddingTop: 9,
          paddingBottom: 9,
          borderWidth: 1.3,
          borderColor: "rgba(212, 175, 55, 0.22)",
          shadowColor: GOLD,
          shadowOpacity: 0.14,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 10 },
          elevation: 18,
        },
        tabBarItemStyle: {
          height: 64,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: (props) => (
            <PremiumTabIcon Icon={Home} label="HOME" {...props} />
          ),
        }}
        listeners={{ tabPress: hapticLight }}
      />

      <Tabs.Screen
        name="services"
        options={{
          tabBarIcon: (props) => <CenterTabIcon {...props} />,
        }}
        listeners={{ tabPress: hapticHeavy }}
      />

      <Tabs.Screen
        name="requests"
        options={{
          tabBarIcon: (props) => (
            <PremiumTabIcon Icon={ClipboardList} label="REQUESTS" {...props} />
          ),
        }}
        listeners={{ tabPress: hapticLight }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: (props) => (
            <PremiumTabIcon Icon={FileText} label="REPORTS" {...props} />
          ),
        }}
        listeners={{ tabPress: hapticLight }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: (props) => (
            <PremiumTabIcon Icon={User} label="PROFILE" {...props} />
          ),
        }}
        listeners={{ tabPress: hapticLight }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 62,
    height: 62,
  },
  activeIndicator: {
    position: "absolute",
    top: -10,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 6,
    textAlign: "center",
  },
  centerActionWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  centerAction: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.42)",
  },
  centerActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
});