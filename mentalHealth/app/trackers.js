import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import WalkingTrackerScreen from "../screens/WalkingTrackerScreen";
import StreakTrackerScreen from "../screens/StreakScreen";
import { View, Text } from "react-native";

const Tab = createMaterialTopTabNavigator();

export default function TrackersScreen() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#4A90E2" },
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold", color: "white" },
          tabBarIndicatorStyle: { backgroundColor: "white", height: 3 },
        }}
      >
        <Tab.Screen name="Walking" component={WalkingTrackerScreen} />
        
        <Tab.Screen name="Streak" component={StreakTrackerScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
