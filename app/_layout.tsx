// Root
// Root Layout File for Expo Router
// This file defines the navigation stack for the app
// and manages screen options like header visibility and navigation behavior.

import { Text } from "react-native";
import { SplashScreen, Stack } from "expo-router";
SplashScreen;
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: " ", // This will hide the "index" text but keep the back button
      }}
    >
      {/* Hide the header for the "index" screen */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* <Stack.Screen name="" options={{ headerShown: false }} /> */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Login Screen Configuration */}
      <Stack.Screen
        name="login"
        options={{
          headerBackTitle: "Home",
          title: "",
          headerTransparent: true,
          headerBackButtonDisplayMode: "generic",
        }}
      />
    </Stack>
  );
}
