import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="walking" options={{ title: "Walking Tracker" }} />
      <Stack.Screen name="forum" options={{ title: "Forum" }} />
    </Stack>
  );
}
