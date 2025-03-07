import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "../navigation/TabNavigator"; // Import your bottom tab navigator
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "./HomeScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* <Stack.Screen name="Onboarding" component={OnboardingScreen} /> */}
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="MainTabs" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
