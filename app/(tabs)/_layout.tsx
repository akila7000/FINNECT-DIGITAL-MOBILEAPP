// Import necessary dependencies
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Platform, Text, TouchableOpacity, Alert } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// API base URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function TabLayout() {
  const router = useRouter();

  // Logout button component..
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // Create an AbortController for timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second time

            // Call the logout API
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
              credentials: "include", // Ensures cookies (session) are sent
              signal: controller.signal, // Timeout handling
            });

            // Clear the timeout
            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error("Logout failed");
            }

            // Clear user data from AsyncStorage
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("userName");

            // Redirect to the home screen
            router.replace("/");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  // Logout button component
  const LogoutButton = () => (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
      <Ionicons name="log-out-outline" size={25} color="white" />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4D911FE",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "500",
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 80 : 90,
          paddingBottom: Platform.OS === "ios" ? 40 : 40,
          paddingTop: 5,
          paddingHorizontal: Platform.OS === "ios" ? 20 : 20,
          backgroundColor: "white",
          justifyContent: "space-between",

          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: "#4D90FE",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerRight: () => <LogoutButton />, // Add logout button to all screens
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerTitle: "FINNET DIGITAL",
        }}
      />
      <Tabs.Screen
        name="receipt"
        options={{
          title: "Find Payment Recipients",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="file-find-outline"
              size={size}
              color={color}
            />
          ),
          headerTitle: "Find Payment Recipients",
        }}
      />
      <Tabs.Screen
        name="receipt-list"
        options={{
          title: "Loan Receipts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          headerTitle: "Loan Receipts",
        }}
      />
      <Tabs.Screen
        name="get-receipt-details"
        options={{
          title: "Get Receipt Details",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file" size={size} color={color} />
          ),
          headerTitle: "Get Receipt Details",
        }}
      />
      <Tabs.Screen
        name="receipt-details"
        options={{
          title: "Receipt Details",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" size={size} color={color} />
          ),
          headerTitle: "Receipt Details",
        }}
      />
      <Tabs.Screen
        name="summary-sheet"
        options={{
          title: "Summary",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="summarize" size={size} color={color} />
          ),
          headerTitle: "Summary Details",
        }}
      />
    </Tabs>
  );
}
