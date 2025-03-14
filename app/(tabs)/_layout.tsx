import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4D90FE",
        // headerShown: false,

        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 69: 90,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
        },
        headerStyle: {
          backgroundColor: "#4D90FE",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
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
        name="Receipt"
        options={{
          title: "eeceipt",
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
