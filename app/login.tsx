//javascript
/**
 * Login Component Documentation
 *
 * Overview:
 * The `Login` component is a React Native screen that allows users to log in to the application.
 * It includes form fields for username/email and password, handles input validation, and integrates
 * with an API to authenticate users. The component also manages error states, network availability,
 * and user feedback during the login process.
 *
 * Key Features:
 * 1. **Input Validation**: Validates the username and password fields to ensure they meet the required criteria.
 * 2. **API Integration**: Communicates with a backend API to authenticate users and handle login responses.
 * 3. **Error Handling**: Displays appropriate error messages for invalid inputs, network issues, or server errors.
 * 4. **Password Visibility Toggle**: Allows users to toggle the visibility of their password.
 * 5. **Network Retry**: Provides an option to retry the login process if a network error occurs.
 * 6. **Forgot Password**: Includes a placeholder for a "Forgot Password" feature.
 * 7. **Loading State**: Displays a loading indicator during API requests.
 * 8. **Persistence**: Stores user session data (e.g., session cookie, username) in AsyncStorage for persistence.
 *
 * State Management:
 * - `username`: Stores the value entered in the username/email field.
 * - `password`: Stores the value entered in the password field.
 * - `errorMessage`: Stores any error messages to be displayed to the user.
 * - `apiStatus`: Tracks the status of the API request (idle, loading, success, error).
 * - `networkAvailable`: Tracks whether the device has an active network connection.
 * - `showPassword`: Toggles the visibility of the password field.
 * - `loggedUser`: Stores the name of the logged-in user.
 * - `errors`: Stores validation errors for the username and password fields.
 *
 * Methods:
 * - `validateInputs()`: Validates the username and password fields and updates the `errors` state.
 * - `handleLogin()`: Handles the login process, including API communication, error handling, and navigation.
 * - `handleRetry()`: Resets the network error state and allows the user to retry the login process.
 * - `handleForgotPassword()`: Displays an alert for the "Forgot Password" feature (placeholder implementation).
 * - `togglePasswordVisibility()`: Toggles the visibility of the password field.
 *
 * UI Components:
 * - **SafeAreaView**: Ensures the content is displayed within the safe area boundaries of the device.
 * - **KeyboardAvoidingView**: Adjusts the view to avoid the keyboard when it is displayed.
 * - **TextInput**: Input fields for username/email and password.
 * - **TouchableOpacity**: Buttons for login, retry, and forgot password.
 * - **ActivityIndicator**: Loading spinner displayed during API requests.
 * - **Alert**: Displays error messages and alerts to the user.
 * - **Image**: Displays the application logo.
 * - **Icons**: Uses icons from `@expo/vector-icons` for error messages, password visibility, and buttons.
 *
 * Styling:
 * - The component uses a `StyleSheet` to define styles for all UI elements, ensuring a consistent look and feel.
 * - Styles include colors, padding, margins, and borders for inputs, buttons, and error messages.
 *
 * Navigation:
 * - On successful login, the user is navigated to the `/receipt` screen using the `useRouter` hook from `expo-router`.
 *
 * Dependencies:
 * - `react-native`: Core components for building the UI.
 * - `@react-native-async-storage/async-storage`: For persisting user session data.
 * - `expo-router`: For navigation between screens.
 * - `@expo/vector-icons`: For displaying icons in the UI.
 *
 * Environment Variables:
 * - `API_BASE_URL`: The base URL for the API is fetched from `process.env.EXPO_PUBLIC_API_BASE_URL`.
 *
 * Usage:
 * - Import and use the `Login` component in your navigation stack to allow users to log in to the application.
 * - Ensure the API endpoint `/auth/login` is correctly configured to handle login requests.
 *
 * Example:
 * ```jsx
 * <Login />
 * ```
 *
 * Notes:
 * - The "Forgot Password" feature is currently a placeholder and requires implementation.
 * - The component assumes the API returns user data in a specific format. Adjust the logic if the API response structure differs.
 * - Ensure proper error handling for network requests, including timeouts and server errors.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  FontAwesome,
  MaterialIcons,
  Entypo,
  AntDesign,
} from "@expo/vector-icons";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const Login = () => {
  const router = useRouter();

  // State management
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [apiStatus, setApiStatus] = useState("idle"); // idle, loading, success, error
  const [networkAvailable, setNetworkAvailable] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loggedUser, setLoggedUser] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  // Validate input fields
  const validateInputs = () => {
    let isValid = true;
    const newErrors = { username: "", password: "" };

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle login with proper API integration
  const handleLogin = async () => {
    // Reset previous state
    setErrorMessage("");
    setApiStatus("loading");

    // Input validation early return
    if (!validateInputs()) {
      setApiStatus("idle");
      return;
    }

    try {
      // Prepare login request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
        signal: controller.signal,
      });

      // Clear timeout
      clearTimeout(timeoutId);

      // Handle non-successful responses
      if (!response.ok) {
        await handleErrorResponse(response);
        return;
      }

      // Parse response
      const responseText = await response.text();

      // Robust JSON parsing
      const data = JSON.parse(responseText);

      // Process successful login
      await processSuccessfulLogin(data, response);
    } catch (error) {
      // Handle different types of errors
      handleLoginError(error);
    } finally {
      // Ensure loading state is reset
      if (apiStatus === "loading") {
        setApiStatus("idle");
      }
    }
  };

  // // Handle error responses from the server
  // const handleErrorResponse = async (response: Response) => {
  //   setApiStatus("error");
  //   try {
  //     const errorText = await response.text();
  //     setErrorMessage(errorText);
  //     Alert.alert("Login Failed", errorText);
  //   } catch (parseError) {
  //     const fallbackErrorMsg = "An unexpected error occurred during processing";
  //     setErrorMessage(fallbackErrorMsg);
  //     Alert.alert("Error", fallbackErrorMsg);
  //   }
  // };

  const handleErrorResponse = async (response: Response) => {
    setApiStatus("error");
    try {
      const errorData = await response.json();
      const errorMsg = errorData.message || "An error occurred during login";
      setErrorMessage(errorMsg);
      Alert.alert("Login Failed", errorMsg);
    } catch (parseError) {
      const fallbackErrorMsg = "An unexpected error occurred during processing";
      setErrorMessage(fallbackErrorMsg);
      Alert.alert("Error", fallbackErrorMsg);
    }
  };

  // Process successful login data
  const processSuccessfulLogin = async (data: any, response: Response) => {
    // Validate user data
    if (Array.isArray(data.user) && data.user.length > 0) {
      const user = data.user[0];
      const fullName = user.FullName;

      // Store user information
      setLoggedUser(fullName);
      await storeUserData(fullName, data, response);

      // Navigate to receipt page
      setApiStatus("success");
      setErrorMessage("");
      router.push("/receipt");
    } else {
      // Handle invalid user data
      setApiStatus("error");
      const errorMsg = data?.message || "Invalid Credentials!";
      setErrorMessage(errorMsg);
      Alert.alert("Login Failed", errorMsg);
    }
  };

  // Store user-related data
  const storeUserData = async (
    fullName: string,
    data: any,
    response: Response
  ) => {
    // Store session cookie if available
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      await AsyncStorage.setItem("sessionCookie", setCookie);
    }

    // Store user data
    await AsyncStorage.setItem("userData", fullName);
    await AsyncStorage.setItem("userData", JSON.stringify(data));
  };

  // Handle different types of login errors
  const handleLoginError = (error: any) => {
    setApiStatus("error");

    let errorMsg = "An unexpected error occurred. Please try again.";

    if (error.name === "AbortError") {
      errorMsg = "Request timed out. Please check your internet connection.";
    } else if (error.message.includes("Network request failed")) {
      errorMsg = "Network error. Please check your internet connection.";
    } else if (error.message) {
      errorMsg = error.message;
    }

    setErrorMessage(errorMsg);
    Alert.alert("Error", errorMsg);
  };
  // Handle retry when network is unavailable
  const handleRetry = () => {
    setNetworkAvailable(true);
    setErrorMessage("");
    setApiStatus("idle");
  };
  // Handle forgot password
  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "Enter your email to receive password reset instructions",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        // {
        //   text: "Submit",
        //   onPress: () =>
        //     Alert.alert("Success", "Password reset link sent to your email!"),
        // },
      ]
    );
  };
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("../assets/images/finnet_logo.png")}
              style={[styles.logo, { width: 250, height: 200 }]}
              resizeMode="cover"
            />

            <Text style={styles.welcomeText}>Welcome Back {loggedUser}</Text>
            <Text style={styles.subText}>Please sign in to continue</Text>
          </View>
          <View style={styles.form}>
            {errorMessage && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={20}
                  color="#EF4444"
                  style={styles.errorIcon}
                />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            {!networkAvailable && (
              <View style={styles.networkErrorContainer}>
                <Text style={styles.networkErrorText}>
                  No internet connection detected.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <FontAwesome
                    size={18}
                    color="white"
                    style={styles.retryIcon}
                  />
                  <Text style={styles.retryText}>Retry Connection</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username or Email</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.username && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) {
                      setErrors({ ...errors, username: "" });
                    }
                  }}
                  placeholder="Enter your username or email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errors.username && (
                <Text style={styles.errorMessage}>{errors.username}</Text>
              )}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <Entypo name="eye" size={18} color="#9CA3AF" />
                  ) : (
                    <Entypo name="eye-with-line" size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              </View>
              {errors.password && (
                <Text style={styles.errorMessage}>{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (apiStatus === "loading" || !networkAvailable) &&
                styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={apiStatus === "loading" || !networkAvailable}
          >
            {apiStatus === "loading" ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <AntDesign
                  size={20}
                  color="white"
                  name="arrowright"
                  style={styles.arrowIcon}
                />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.poweredByContainer}>
              <Text style={styles.poweredByText}>Powered By</Text>
              <Image
                source={require("../assets/images/pcsLogo.jpeg")}
                style={styles.poweredByLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F4",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  networkErrorContainer: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  networkErrorText: {
    color: "#D97706",
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 1,
  },
  errorMessage: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#93C5FD",
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: 20,
  },
  poweredByContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  poweredByText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  poweredByLogo: {
    width: 100,
    height: 40,
  },
});

export default Login;
