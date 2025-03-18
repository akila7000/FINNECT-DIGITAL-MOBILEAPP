import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Platform, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function TabLayout() {
  const router = useRouter();

  // Logout function
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
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
              const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

              // Call the logout API
              const response = await fetch(`/auth/logout`, {
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

              // Redirect to the login screen
              router.replace("/");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Logout button component
  const LogoutButton = () => (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
      <Ionicons name="log-out-outline" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4D911FE",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 69 : 90,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
          backgroundColor: "white",
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
          title: "Receipt",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
          headerTitle: "Add Receipt",
        }}
      />
      <Tabs.Screen
        name="receipt-list"
        options={{
          title: "Receipt List",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          headerTitle: "Your Receipts",
        }}
      />
    </Tabs>
  );
}