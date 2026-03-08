import BottomTabBar from "@/src/components/bottomTabBar/BottomTabBar";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <BottomTabBar />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="plants" />
    </Tabs>
  );
}
