import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";
import { useLocalSearchParams } from "expo-router";

// Define types
type ReceiptItem = {
  loanID: string;
  LoanNo: number;
  Client_Name: string;
  GroupName: string;
  Loan_Amount: number;
  Rental_Amount: number;
  payAmount?: number;
  Total_Due: number;
};

interface HeaderComponentProps {
  activeLogBtn: boolean;
  title: string;
  onBack: () => void;
  logOut: () => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  activeLogBtn,
  title,
  onBack,
  logOut,
}) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <FontAwesome name="arrow-left" size={24} color="#333" />
    </TouchableOpacity>

    <Text style={styles.headerTitle}>{title}</Text>

    {activeLogBtn && (
      <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
        <Feather name="user" size={20} color="#4D90FE" />
      </TouchableOpacity>
    )}
  </View>
);

interface ReceiptItemComponentProps {
  item: ReceiptItem;
  onPress: () => void;
}

// Receipt Item Component
const ReceiptItemComponent: React.FC<ReceiptItemComponentProps> = ({
  item,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.receiptItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.receiptHeader}>
      <Text style={styles.receiptId}>{item.LoanNo}</Text>
      <Text style={styles.receiptName}>{item.Client_Name}</Text>
    </View>
    <View style={styles.receiptBody}>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Rental Amount</Text>
        <Text style={styles.rentalAmountValue}>{item.Rental_Amount}</Text>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Due Amount</Text>
        <Text style={styles.dueAmountValue}>{item.Total_Due}</Text>
      </View>
      {item.payAmount !== undefined && (
        <View style={styles.payAmountContainer}>
          <Text style={styles.payAmountText}>
            Pay Amount - {item.payAmount.toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

interface PayModalComponentProps {
  isVisible: boolean;
  onClose: () => void;
  selectedReceipt: ReceiptItem | null;
  payAmount: string;
  setPayAmount: (value: string) => void;
  isUpdatingPayment: boolean;
  onPayAmountEnter: () => void;
}

// Pay Modal Component
const PayModalComponent: React.FC<PayModalComponentProps> = ({
  isVisible,
  onClose,
  selectedReceipt,
  payAmount,
  setPayAmount,
  isUpdatingPayment,
  onPayAmountEnter,
}) => (
  <Modal
    visible={isVisible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Enter Pay Amount</Text>
          {!isUpdatingPayment && (
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.modalReceiptId}>
          Loan: {selectedReceipt ? selectedReceipt.LoanNo : ""} -{" "}
          {selectedReceipt ? selectedReceipt.Client_Name : ""}
        </Text>

        <TextInput
          style={styles.modalInput}
          placeholder="Enter Pay Amount"
          keyboardType="number-pad"
          value={payAmount}
          onChangeText={(text) => setPayAmount(text.replace(/[^0-9]/g, ""))}
          editable={!isUpdatingPayment}
        />

        <TouchableOpacity
          style={[
            styles.enterButton,
            isUpdatingPayment && styles.updatingButton,
          ]}
          onPress={onPayAmountEnter}
          disabled={isUpdatingPayment}
          activeOpacity={0.7}
        >
          {isUpdatingPayment ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.enterButtonText}>Enter</Text>
          )}
        </TouchableOpacity>

        {!isUpdatingPayment && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </Modal>
);

const MFReceiptList: React.FC = () => {
  // Get params from router
  const params = useLocalSearchParams();
  const { receiptData: receiptDataParam } = params;

  const [totalAmount, setTotalAmount] = useState<string>("600000");
  const [isPayModalVisible, setPayModalVisible] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(
    null
  );
  const [payAmount, setPayAmount] = useState<string>("");
  const [receiptData, setReceiptData] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<boolean>(false);

  const navigation = useNavigation();

  // Use a single useEffect to handle the params
  useEffect(() => {
    if (receiptDataParam) {
      try {
        const parsedData = JSON.parse(receiptDataParam as string);
        setReceiptData(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to parse receipt data:", error);
        setError("Failed to parse receipt data. Please try again.");
        setIsLoading(false);
      }
    } else {
      // Fetch sample data only if no params were passed
      fetchReceiptData();
    }
  }, [receiptDataParam]); // Only depends on receiptDataParam

  const fetchReceiptData = async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sample data when no params provided
      const sampleData = [
        {
          loanID: "loan1",
          LoanNo: 1234,
          Client_Name: "John Doe",
          GroupName: "Group A",
          Loan_Amount: 10000,
          Rental_Amount: 1000,
          Total_Due: 5000,
        },
        {
          loanID: "loan2",
          LoanNo: 2345,
          Client_Name: "Jane Smith",
          GroupName: "Group B",
          Loan_Amount: 15000,
          Rental_Amount: 1500,
          Total_Due: 7500,
        },
      ];

      setReceiptData(sampleData);
    } catch (err) {
      const errorMessage = "Failed to load receipt data. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      console.error("Error fetching receipt data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchReceiptData(true);
  };

  const handlePayAmountEnter = async () => {
    if (!selectedReceipt) return;
    if (!payAmount || parseFloat(payAmount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid payment amount.");
      return;
    }
    setIsUpdatingPayment(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Fix: Use loanID instead of id for matching
      const updatedReceipts = receiptData.map((receipt) =>
        receipt.loanID === selectedReceipt.loanID
          ? { ...receipt, payAmount: parseFloat(payAmount) }
          : receipt
      );

      setReceiptData(updatedReceipts);
      setPayModalVisible(false);
      setPayAmount("");
      setSelectedReceipt(null);
      Alert.alert("Success", "Payment amount updated successfully.");
    } catch (err) {
      Alert.alert(
        "Error",
        "Failed to update payment amount. Please try again."
      );
      console.error("Error updating payment:", err);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleTotalAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setTotalAmount(numericValue);
  };

  const handleSave = async () => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid total amount.");
      return;
    }
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call

      // Here you could add logic to save the total amount along with all receipt payments
      const receiptsWithPayments = receiptData.filter(
        (item) => item.payAmount !== undefined
      );
      console.log("Saving receipts with payments:", receiptsWithPayments);

      Alert.alert("Success", "Total amount and payments saved successfully.");
    } catch (err) {
      Alert.alert("Error", "Failed to save total amount. Please try again.");
      console.error("Error saving total amount:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackPress = () => {
    Alert.alert("Confirm", "Are you sure you want to go back?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          if (router.canGoBack()) {
            navigation.goBack();
          } else {
            router.replace("/"); // Redirect to a default route
          }
        },
      },
    ]);
  };

  const logOut = async () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          // await authUtils.removeUserToken();
          router.replace("/"); // Reset the route
        },
      },
    ]);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No receipt data available.</Text>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={["left", "right"]} // Don't include top edge to reduce padding
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20} // Increased offset
      >
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4D90FE" />
              <Text style={styles.loadingText}>Loading receipts...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchReceiptData()}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={receiptData}
              renderItem={({ item }) => (
                <ReceiptItemComponent
                  item={item}
                  onPress={() => {
                    setSelectedReceipt(item);
                    setPayAmount(
                      item.payAmount ? item.payAmount.toString() : ""
                    );
                    setPayModalVisible(true);
                  }}
                />
              )}
              keyExtractor={(item) => item.loanID}
              contentContainerStyle={[
                styles.listContainer,
                { paddingBottom: 80 }, // Add extra padding at bottom for footer space
              ]}
              ListEmptyComponent={renderEmptyList}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={["#4D90FE"]}
                  tintColor="#4D90FE"
                />
              }
            />
          )}
        </View>

        {/* Remove SafeAreaView around the footer */}
        <View style={styles.footerContainer}>
          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalAmountTitle}>Total Amount</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.totalAmountInput}
                placeholder="Enter total amount"
                value={totalAmount}
                onChangeText={handleTotalAmountChange}
                keyboardType="number-pad"
                editable={!isSaving}
              />
            </View>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.savingButton]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <PayModalComponent
        isVisible={isPayModalVisible}
        onClose={() => {
          if (!isUpdatingPayment) {
            setPayModalVisible(false);
            setSelectedReceipt(null);
            setPayAmount("");
          }
        }}
        selectedReceipt={selectedReceipt}
        payAmount={payAmount}
        setPayAmount={setPayAmount}
        isUpdatingPayment={isUpdatingPayment}
        onPayAmountEnter={handlePayAmountEnter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", // Fixed typo in color
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 14,
    backgroundColor: "white",
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  logoutButton: {
    padding: 8,
  },
  listContainer: {
    padding: 14,
  },
  receiptItem: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6ca1ff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    padding: 14,
  },
  receiptId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  receiptName: {
    fontSize: 14,
    color: "#666",
  },
  receiptBody: {
    padding: 14,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: "#666",
  },
  rentalAmountValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  dueAmountValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
  payAmountContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#E8F2FF",
    borderRadius: 6,
  },
  payAmountText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4D90FE",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#4D90FE",
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: "white",
  },
  footerContainer: {
    backgroundColor: "white",
    padding: 14,
    borderTopColor: "#E0E0E0",
    borderTopWidth: 1,
 
    zIndex: 2,
  },
  totalAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalAmountTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  inputContainer: {
    flex: 1,
    marginLeft: 14,
  },
  totalAmountInput: {
    fontSize: 14,
    color: "#333",
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4D90FE",
    borderRadius: 8,
    marginLeft: 10,
  },
  savingButton: {
    backgroundColor: "#A0C4FF",
  },
  saveButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalReceiptId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 14,
  },
  modalInput: {
    fontSize: 14,
    color: "#333",
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 14,
  },
  enterButton: {
    padding: 12,
    backgroundColor: "#4D90FE",
    borderRadius: 8,
    alignItems: "center",
  },
  updatingButton: {
    backgroundColor: "#A0C4FF",
  },
  enterButtonText: {
    fontSize: 14,
    color: "white",
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#FF3B30",
  },
});

export default MFReceiptList;
