import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

import HomeScreen from "../app/HomeScreen"
import MeditationScreen from "../app/MeditationScreen"
import JournalScreen from "../screens/JournalScreen"
import WalkingTrackerScreen from "../screens/WalkingTrackerScreen"

import ForumScreen from "../screens/ForumScreen"
import LearningProgramScreen from "../app/LearningProgramScreen"
import StreakScreen from "../screens/StreakScreen"
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

const Tab = createBottomTabNavigator()
const MoreStack = createNativeStackNavigator()

const MoreStackNavigator = () => {
    return (
        <MoreStack.Navigator screenOptions={{ headerShown: false }}>
            <MoreStack.Screen name="StreakScreen" component={StreakScreen} />
            <MoreStack.Screen name="LearningProgram" component={LearningProgramScreen} />
            <MoreStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        </MoreStack.Navigator>
    )
}

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName

                    if (route.name === "Home") {
                        iconName = focused ? "home" : "home-outline"
                    } else if (route.name === "Meditation") {
                        iconName = focused ? "leaf" : "leaf-outline"
                    } else if (route.name === "Journal") {
                        iconName = focused ? "journal" : "journal-outline"
                    } else if (route.name === "Walking") {
                        iconName = focused ? "footsteps" : "footsteps-outline"
                    } else if (route.name === "Forum") {
                        iconName = focused ? "people" : "people-outline"
                    } else if (route.name === "More") {
                        iconName = focused ? "menu" : "menu-outline"
                    }

                    return <Ionicons name={iconName} size={size} color={color} />
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
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Meditation" component={MeditationScreen} />
            <Tab.Screen name="Journal" component={JournalScreen} />
            <Tab.Screen name="Walking" component={WalkingTrackerScreen} />
            <Tab.Screen name="Sleep" component={SleepTrackerScreen} />
            <Tab.Screen name="Forum" component={ForumScreen} />
            <Tab.Screen name="More" component={MoreStackNavigator} />
        </Tab.Navigator>
    )
}

export default TabNavigator
