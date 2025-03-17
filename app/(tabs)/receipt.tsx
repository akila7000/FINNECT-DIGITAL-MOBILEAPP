import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
// import authUtils from "../utils/authUtils";
import { useNavigation } from "expo-router";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import HeaderComponet from "@/components/Header";

interface DropdownItem {
  label: string;
  value: string;
}

export default function MFReceipt() {
  // State management
  const [cashierBranch, setCashierBranch] = useState("");
  const [loanBranch, setLoanBranch] = useState("");
  const [center, setCenter] = useState("");
  const [grp, setGroup] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<{
    center?: string;
    search?: string;
    grp?: string;
  }>({});
  const [apiStatus, setApiStatus] = useState("idle");

  // Selected item display text
  const [cashierBranchText, setCashierBranchText] = useState("");
  const [loanBranchText, setLoanBranchText] = useState("");
  const [centerText, setCenterText] = useState("");
  const [groupText, setGroupText] = useState("");

  // Current active dropdown
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Search filters
  const [dropdownSearch, setDropdownSearch] = useState("");

  const router = useRouter();
  const navigation = useNavigation();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      // const token = await authUtils.getUserToken();
      const userDataSet = await AsyncStorage.getItem("userData");

      if (userDataSet) {
        const userData = JSON.parse(userDataSet);
        setUserRole(userData.role);
        setUserId(userData.id);
      }

      // if (!token) {
      //   router.push("/");
      // }
    };

    checkAuth();
  }, []);

  // Simulate API call when center is selected
  useEffect(() => {
    if (center) {
      setApiStatus("loading");
      setTimeout(() => {
        setCashierBranch("branch1");
        setCashierBranchText("Branch 1");
        setLoanBranch("branchA");
        setLoanBranchText("Branch A");
        setApiStatus("success");
      }, 1000);
    }
  }, [center]);

  // Handle form submission
  const handleSubmit = () => {
    const newErrors: { center?: string; search?: string; grp?: string } = {};

    if (!center) {
      newErrors.center = "Please select a center";
    }
    if (!grp) {
      newErrors.grp = "Please select a group";
    }
    // if (!searchQuery.trim()) {
    //   newErrors.search = "Please enter a username or ID";
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setApiStatus("loading");

    // Simulate API call
    setTimeout(() => {
      const receiptData = {
        cashierBranch,
        loanBranch,
        center,
        searchQuery,
      };

      setApiStatus("success");
      Alert.alert("Success", "Receipt details fetched successfully");

      // Navigate to ReceiptList with data
      router.push({
        pathname: "/",
        params: { receiptData: JSON.stringify(receiptData) },
      });
    }, 1500);
  };

  // Handle back button
  // const handleBackPress = () => {
  //   Alert.alert("Confirm", "Are you sure you want to go back?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Yes",
  //       onPress: () => {
  //         if (router.canGoBack()) {
  //           navigation.goBack();
  //         } else {
  //           router.replace("/"); // Redirect to a default route
  //         }
  //       },
  //     },
  //   ]);
  // };

  // const logOut = async () => {
  //   Alert.alert("Confirm", "Are you sure you want to log out?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Yes",
  //       onPress: async () => {
  //         // await authUtils.removeUserToken();
  //         router.replace("/");
  //       },
  //     },
  //   ]);
  // };

  // Dropdown data
  const cashierBranches = useMemo<DropdownItem[]>(
    () => [
      { label: "Branch 1", value: "branch1" },
      { label: "Branch 2", value: "branch2" },
    ],
    []
  );

  const loanBranches = useMemo<DropdownItem[]>(
    () => [
      { label: "Branch A", value: "branchA" },
      { label: "Branch B", value: "branchB" },
    ],
    []
  );

  const centers = useMemo<DropdownItem[]>(
    () => [
      { label: "Center 1", value: "center1" },
      { label: "Center 2", value: "center2" },
      { label: "Center 3", value: "center3" },
      { label: "Center 4", value: "center4" },
    ],
    []
  );

  const groups = useMemo<DropdownItem[]>(
    () => [
      { label: "Group 1", value: "grp1" },
      { label: "Group 2", value: "grp2" },
      { label: "Group 3", value: "grp3" },
      { label: "Group 4", value: "grp4" },
   
    ],
    []
  );

  // Get dropdown items based on active dropdown
  const getDropdownItems = (): DropdownItem[] => {
    const search = dropdownSearch.toLowerCase();

    switch (activeDropdown) {
      case "cashier":
        return cashierBranches.filter((item) =>
          item.label.toLowerCase().includes(search)
        );
      case "loan":
        return loanBranches.filter((item) =>
          item.label.toLowerCase().includes(search)
        );
      case "center":
        return centers.filter((item) =>
          item.label.toLowerCase().includes(search)
        );
      case "group":
        return groups.filter((item) =>
          item.label.toLowerCase().includes(search)
        );
      default:
        return [];
    }
  };

  // Handle dropdown item selection
  const handleSelectItem = (item: DropdownItem) => {
    switch (activeDropdown) {
      case "cashier":
        setCashierBranch(item.value);
        setCashierBranchText(item.label);
        break;
      case "loan":
        setLoanBranch(item.value);
        setLoanBranchText(item.label);
        break;
      case "center":
        setCenter(item.value);
        setCenterText(item.label);
        if (errors.center) setErrors({ ...errors, center: undefined });
        break;
      case "group":
        setGroup(item.value);
        setGroupText(item.label);
        if (errors.grp) setErrors({ ...errors, grp: undefined });
        break;
    }

    closeDropdown();
  };

  // Open dropdown
  const openDropdown = (type: string) => {
    setActiveDropdown(type);
    setDropdownSearch("");
    Keyboard.dismiss();
  };

  // Close dropdown
  const closeDropdown = () => {
    setActiveDropdown(null);
    setDropdownSearch("");
  };

  // Render field with selection UI
  const renderSelectField = (
    label: string,
    placeholder: string,
    value: string,
    type: string,
    error?: string
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TouchableOpacity
          onPress={() => openDropdown(type)}
          style={[styles.selectField, error ? styles.errorField : null]}
          activeOpacity={0.7}
        >
          <View style={styles.searchIcon}>
            <FontAwesome name="search" size={18} color="#4B5563" />
          </View>
          <Text
            style={[styles.selectText, !value ? styles.placeholderText : null]}
          >
            {value || placeholder}
          </Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexGrow}
      >
        <View style={styles.flexGrow}>
       

          <ScrollView style={styles.flexGrow}>
            <View style={styles.contentContainer}>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Select the options below to view available receipts. Start by
                  selecting a center.
                </Text>
                <Text style={styles.userIdText}>{userId}</Text>
              </View>

              {/* Dropdowns */}
              {renderSelectField(
                "Select Cashier Branch",
                "Search for cashier branch",
                cashierBranchText,
                "cashier"
              )}

              {renderSelectField(
                "Select Loan Branch",
                "Search for loan branch",
                loanBranchText,
                "loan"
              )}

              {renderSelectField(
                "Select Center",
                "Search for center",
                centerText,
                "center",
                errors.center
              )}

              {renderSelectField(
                "Select Group",
                "Search for group",
                groupText,
                "group",
                errors.grp
              )}

              {/* Search Input */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Enter ID/Account Number</Text>
                <View style={styles.searchInputContainer}>
                  <View style={styles.searchIcon}>
                    <FontAwesome name="search" size={18} color="#4B5563" />
                  </View>
                  <TextInput
                    style={[
                      styles.searchInput,
                      errors.search ? styles.errorField : null,
                      apiStatus === "loading" ? styles.disabledInput : null,
                    ]}
                    placeholder="Enter ID or name to search"
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      if (errors.search) {
                        setErrors({ ...errors, search: undefined });
                      }
                    }}
                    editable={apiStatus !== "loading"}
                  />
                </View>
                {errors.search && (
                  <Text style={styles.errorText}>{errors.search}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={apiStatus === "loading"}
                style={[
                  styles.submitButton,
                  apiStatus === "loading"
                    ? styles.loadingButton
                    : styles.activeButton,
                ]}
              >
                {apiStatus === "loading" ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={[styles.buttonText, styles.loadingText]}>
                      Processing...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Fetch Receipts</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Dropdown Modal */}
          <Modal
            visible={activeDropdown !== null}
            transparent={true}
            animationType="fade"
            onRequestClose={closeDropdown}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={closeDropdown}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {activeDropdown === "cashier" && "Select Cashier Branch"}
                    {activeDropdown === "loan" && "Select Loan Branch"}
                    {activeDropdown === "center" && "Select Center"}
                    {activeDropdown === "group" && "Select Group"}
                  </Text>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalSearchContainer}>
                    <View style={styles.modalSearchIcon}>
                      <FontAwesome name="search" size={18} color="#4B5563" />
                    </View>
                    <TextInput
                      style={styles.modalSearchInput}
                      placeholder="Search..."
                      value={dropdownSearch}
                      onChangeText={setDropdownSearch}
                      autoFocus
                    />
                  </View>

                  <FlatList
                    data={getDropdownItems()}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleSelectItem(item)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <View style={styles.emptyList}>
                        <Text style={styles.emptyListText}>
                          No results found
                        </Text>
                      </View>
                    }
                    style={styles.dropdownList}
                  />
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeDropdown}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:30,
    backgroundColor: "#ffffff",
  },
  flexGrow: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoBox: {
    backgroundColor: "#EBF5FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    color: "#1E40AF",
    fontSize: 12,
  },
  userIdText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  selectField: {
    width: "100%",
    position: "relative",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    position: "absolute",
    top: 0,
    left: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  searchIconContainer: {
    position: "absolute",
    top: 0,
    left: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  searchInputContainer: {
    position: "relative",
  },
  selectText: {
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 14,
    color: "#000000",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  errorField: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: "relative",
  },
  searchInput: {
    width: "100%",
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },
  disabledInput: {
    opacity: 0.7,
  },
  submitButton: {
    width: "100%",
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingButton: {
    backgroundColor: "#93C5FD",
  },
  activeButton: {
    backgroundColor: "#2563EB",
  },
  disabledButton: {
    backgroundColor: "#93C5FD",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonTextLoading: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 16,
    marginTop: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  modalBody: {
    padding: 16,
  },
  modalSearchContainer: {
    position: "relative",
    marginBottom: 16,
  },
  modalSearchIcon: {
    position: "absolute",
    top: 0,
    left: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  modalSearchInput: {
    width: "100%",
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#D1D5DB",
    fontSize: 14,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 14,
  },
  emptyList: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyListText: {
    color: "#6B7280",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    paddingVertical: 12,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
