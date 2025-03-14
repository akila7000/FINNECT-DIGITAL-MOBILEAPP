import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";

// Save user token to AsyncStorage
const saveUserToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("userToken", token);
  } catch (error) {
    console.error("Failed to save user token", error);
  }
};

// Get user token from AsyncStorage
const getUserToken = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    return token;
  } catch (error) {
    console.error("Failed to fetch user token", error);
  }
};

// Remove user token from AsyncStorage (logout)
const removeUserToken = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
  } catch (error) {
    console.error("Failed to remove user token", error);
  }
};

export default {
  saveUserToken,
  getUserToken,
  removeUserToken,
};