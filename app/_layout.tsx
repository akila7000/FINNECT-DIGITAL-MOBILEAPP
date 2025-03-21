// App

import { Text } from "react-native";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: " ", // This will hide the "index" text but keep the back button
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* <Stack.Screen name="" options={{ headerShown: false }} /> */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          headerBackTitle: "Home",
          title: "",
          headerTransparent: true,
          headerBackButtonDisplayMode: "generic",
        }}
      />
      :
    </Stack>
  );
}
