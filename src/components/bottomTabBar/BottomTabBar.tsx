import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/desingSystem";
import { createTabStyles } from "./BottomTabBar.styles";

type TabItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconActive: React.ComponentProps<typeof Ionicons>["name"];
};

const LEFT_TABS: TabItem[] = [
  { key: "home", label: "Para Ti", icon: "home-outline", iconActive: "home" },
  { key: "diagnose", label: "Diagnosticar", icon: "medkit-outline", iconActive: "medkit" },
];

const RIGHT_TABS: TabItem[] = [
  { key: "plants", label: "Mis Plantas", icon: "leaf-outline", iconActive: "leaf" },
  { key: "profile", label: "Mi Perfil", icon: "person-outline", iconActive: "person" },
];

type Props = {
  activeTab?: string;
};

export default function BottomTabBar({ activeTab = "plants" }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const tabStyles = createTabStyles(theme);
  const activeColor = theme.colors.tabBarActive;
  const inactiveColor = theme.colors.tabBarInactive;

  const renderTab = (tab: TabItem) => {
    const isActive = activeTab === tab.key;
    return (
      <TouchableOpacity key={tab.key} style={tabStyles.tabItem} activeOpacity={theme.opacity.pressableTab}>
        <Ionicons
          name={isActive ? tab.iconActive : tab.icon}
          size={theme.dimensions.tabBarIconSize}
          color={isActive ? activeColor : inactiveColor}
        />
        <Text style={[tabStyles.tabLabel, isActive && tabStyles.tabLabelActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[tabStyles.root, { paddingBottom: insets.bottom }]}>
      <View style={tabStyles.bar}>
        {LEFT_TABS.map(renderTab)}
        <View style={tabStyles.centerSpacer} />
        {RIGHT_TABS.map(renderTab)}
      </View>

      {/* Arco curvo que engloba el botón central */}
      <View style={tabStyles.arcWrapper} pointerEvents="none">
        <View style={tabStyles.arcBump} />
      </View>

      <View style={tabStyles.centerButtonWrapper} pointerEvents="box-none">
        <TouchableOpacity style={tabStyles.centerButton} activeOpacity={theme.opacity.pressableCenterButton}>
          <Ionicons name="camera" size={theme.dimensions.cameraIconSize} color={theme.colors.textOnAccent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
