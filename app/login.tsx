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

// import authUtils from "./utils/authUtils";

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
    // Reset previous errors
    setErrorMessage("");

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    try {
      // Set loading state
      setApiStatus("loading");

      // Make API request with timeout for better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      const response = await fetch(`http://172.16.1.10:5246/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: controller.signal, // This is important for the timeout to work
      });

      clearTimeout(timeoutId); // Clear timeout after response is received

      const data = await response.json(); // Parse response after clearing timeout

      if (response.ok) {
        // Check if the server returned valid user data
        if (Array.isArray(data) && data.length > 0) {
          const user = data[0]; // Get the first item in the array
          const fullName = user.FullName; // "Test Login"
          console.log("User Full Name:", fullName);
          setLoggedUser(fullName);

          // Also store the username in AsyncStorage for persistence
          await AsyncStorage.setItem("userName", fullName);
        }

        console.log(response, "Response");
        if (data) {
          // Store user session
          await AsyncStorage.setItem("userData", JSON.stringify(data));

          // Update status
          setApiStatus("success");
          // Clear any existing errors
          setErrorMessage("");
          // Navigate to the protected page after successful login
          router.push("/receipt");
        } else {
          console.log("Error", response);
          // Handle invalid user data format
          setApiStatus("error");
          setErrorMessage("Invalid Credentials!");
          Alert.alert("Login Failed", "Invalid Credentials!");
        }
      } else {
        // Handle different error status codes
        setApiStatus("error");
        if (response.status === 401) {
          setErrorMessage("Invalid username or password");
          Alert.alert("Login Failed", "Invalid username or password");
        } else if (response.status === 403) {
          setErrorMessage("Your account is locked. Please contact support.");
          Alert.alert(
            "Account Locked",
            "Your account is locked. Please contact support."
          );
        } else if (response.status >= 500) {
          setErrorMessage("Server error. Please try again later.");
          Alert.alert(
            "Server Error",
            "Server is currently unavailable. Please try again later."
          );
        } else {
          // Generic error message for other status codes
          setErrorMessage(data?.message || "Login failed");
          Alert.alert("Login Failed", data?.message || "Something went wrong");
        }
      }
    } catch (error) {
      // Set error state
      setApiStatus("error");

      // Handle different error types
      if (
        error instanceof TypeError &&
        error.message.includes("Network request failed")
      ) {
        setNetworkAvailable(false);
        setErrorMessage(
          "Network error. Please check your internet connection."
        );
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      } else if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("Request timed out. Please try again.");
        Alert.alert("Timeout", "Request timed out. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again!");
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      // Always clean up loading state
      if (apiStatus === "loading") {
        setApiStatus("idle");
      }
    }
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
        {
          text: "Submit",
          onPress: () =>
            Alert.alert("Success", "Password reset link sent to your email!"),
        },
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
              source={require("../assets/images/pcsLogo.jpeg")}
              style={styles.logo}
              resizeMode="contain"
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
                    <Entypo name="eye" size={20} color="#9CA3AF" />
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
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
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: 20,
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
    padding: 8,
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
});

export default Login;
