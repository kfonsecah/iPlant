import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTheme, useTheme } from "../../theme/desingSystem";
import { createTabStyles } from "./BottomTabBar.styles";

type TabItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconActive: React.ComponentProps<typeof Ionicons>["name"];
};

const ROUTE_MAP: Record<string, string> = {
  home:      "/home",
  asistente: "/asistente",
  plants:    "/plants",
  profile:   "/profile",
};

const LEFT_TABS: TabItem[] = [
  { key: "home",      label: "Para Ti",  icon: "home-outline",                 iconActive: "home" },
  { key: "asistente", label: "Asistente", icon: "chatbubble-ellipses-outline", iconActive: "chatbubble-ellipses" },
];

const RIGHT_TABS: TabItem[] = [
  { key: "plants",  label: "Mis Plantas", icon: "leaf-outline",   iconActive: "leaf"   },
  { key: "profile", label: "Mi Perfil",   icon: "person-outline", iconActive: "person" },
];

// ─── TabButton ────────────────────────────────────────────────────────────────

type TabButtonProps = {
  tab: TabItem;
  isActive: boolean;
  onPress: (key: string) => void;
  tabStyles: ReturnType<typeof createTabStyles>;
  theme: AppTheme;
};

function TabButton({ tab, isActive, onPress, tabStyles, theme }: TabButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.82, { damping: 12, stiffness: 220 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
  };

  return (
    <Pressable
      style={tabStyles.tabItem}
      onPress={() => onPress(tab.key)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View className="items-center justify-center" style={animStyle}>
        <Ionicons
          name={isActive ? tab.iconActive : tab.icon}
          size={theme.dimensions.tabBarIconSize}
          color={isActive ? theme.colors.tabBarActive : theme.colors.tabBarInactive}
        />
        <Text style={[tabStyles.tabLabel, isActive && tabStyles.tabLabelActive]}>
          {tab.label}
        </Text>
        {isActive && <View style={tabStyles.activeIndicator} />}
      </Animated.View>
    </Pressable>
  );
}

// ─── CenterButton ─────────────────────────────────────────────────────────────

type CenterButtonProps = {
  tabStyles: ReturnType<typeof createTabStyles>;
  theme: AppTheme;
  onPress: () => void;
};

function CenterButton({ tabStyles, theme, onPress }: CenterButtonProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 900 }),
        withTiming(1.0,  { duration: 900 }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={tabStyles.centerButtonWrapper} pointerEvents="box-none">
      <Animated.View style={pulseStyle}>
        <TouchableOpacity
          style={tabStyles.centerButton}
          activeOpacity={theme.opacity.pressableCenterButton}
          onPress={onPress}
        >
          <Ionicons
            name="camera"
            size={theme.dimensions.cameraIconSize}
            color={theme.colors.textOnAccent}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── BottomTabBar ─────────────────────────────────────────────────────────────

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const tabStyles = createTabStyles(theme);

  const activeTab = pathname.replace(/^\//, "");

  const handleTabPress = (key: string) => {
    if (activeTab !== key) {
      router.navigate(ROUTE_MAP[key] as any);
    }
  };

  const handleCameraPress = () => {
    router.push("/camera" as any);
  };

  return (
    <View style={[tabStyles.root, { paddingBottom: insets.bottom }]}>
      <View style={tabStyles.bar}>
        {LEFT_TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={handleTabPress}
            tabStyles={tabStyles}
            theme={theme}
          />
        ))}
        <View style={tabStyles.centerSpacer} />
        {RIGHT_TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={handleTabPress}
            tabStyles={tabStyles}
            theme={theme}
          />
        ))}
      </View>

      {/* Arco curvo que engloba el botón central */}
      <View style={tabStyles.arcWrapper} pointerEvents="none">
        <View style={tabStyles.arcBump} />
      </View>

      <CenterButton tabStyles={tabStyles} theme={theme} onPress={handleCameraPress} />
    </View>
  );
}
