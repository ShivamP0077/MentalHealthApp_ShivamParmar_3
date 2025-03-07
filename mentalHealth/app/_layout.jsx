import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "meditation") {
            iconName = focused ? "leaf" : "leaf-outline";
          } else if (route.name === "journal") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "trackers") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else {
            iconName = focused ? "menu" : "menu-outline"; // More tab icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "#888",
        headerShown: false,
        tabBarStyle: {
          paddingVertical: 5,
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="meditation" options={{ title: "Meditation" }} />
      <Tabs.Screen name="journal" options={{ title: "Journal" }} />
      
      {/* ✅ Trackers Tab (Combines Walking, Sleep, and Streak) */}
      <Tabs.Screen name="trackers" options={{ title: "Trackers" }} />

      {/* More Tab for additional features */}
      <Tabs.Screen name="more" options={{ title: "More", href: "/more" }} />
    </Tabs>
  );
}
