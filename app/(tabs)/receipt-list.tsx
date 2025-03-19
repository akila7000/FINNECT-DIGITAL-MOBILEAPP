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
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Define types
type ReceiptItem = {
  loanID: number;
  LoanNo: any;
  Client_Name: string;
  GroupName: string;
  Loan_Amount: number;
  Rental_Amount: number;
  payAmount?: number;
  Total_Due: number;
};

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
  const { branchID, collectDate, userBranchID } = params;

  // console.log( branchID, collectDate, userBranchID);

  const [totalAmount, setTotalAmount] = useState<string>("0");
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
          loanID: 234,
          LoanNo: "loan1",
          Client_Name: "John Doe",
          GroupName: "Group A",
          Loan_Amount: 10000,
          Rental_Amount: 1000,
          Total_Due: 5000,
        },
        {
          loanID: 123,
          LoanNo: "loan2",
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
      // Calculate the new Total_Due locally
      const paymentAmount = parseFloat(payAmount);
      const newTotalDue = selectedReceipt.Total_Due - paymentAmount;

      // Ensure the Total_Due doesn't go below zero
      const updatedTotalDue = Math.max(newTotalDue, 0);

      // Update the local state with the new Total_Due and payAmount
      const updatedReceipts = receiptData.map((receipt) =>
        receipt.loanID === selectedReceipt.loanID
          ? {
              ...receipt,
              Total_Due: updatedTotalDue, // Update Total_Due
              payAmount: paymentAmount, // Update payAmount
            }
          : receipt
      );

      // Update the state with the modified receipt data
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

    // Calculate the sum of all pay amounts
    const receiptsWithPayments = receiptData.filter(
      (item) => item.payAmount !== undefined && item.payAmount !== null
    );

    const totalPayAmount = receiptsWithPayments.reduce(
      (sum, item) => sum + (item.payAmount || 0),
      0
    );

    // Compare total pay amount with entered total amount
    const enteredTotal = parseFloat(totalAmount);

    if (receiptsWithPayments.length === 0) {
      Alert.alert(
        "No Payments",
        "You haven't entered any payment amounts. Would you like to proceed anyway?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Proceed",
            onPress: () =>
              processPayment(
                enteredTotal,
                totalPayAmount,
                receiptsWithPayments
              ),
          },
        ]
      );
      return;
    }

    if (totalPayAmount !== enteredTotal) {
      Alert.alert(
        "Amount Mismatch",
        `The sum of payment amounts (${totalPayAmount}) doesn't match the entered total amount (${enteredTotal}). Would you like to proceed anyway?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Proceed",
            onPress: () =>
              processPayment(
                enteredTotal,
                totalPayAmount,
                receiptsWithPayments
              ),
          },
        ]
      );
      return;
    }

    // If amounts match, proceed with saving
    processPayment(enteredTotal, totalPayAmount, receiptsWithPayments);
  };

  const processPayment = async (
    enteredTotal: any,
    totalPayAmount: any,
    receiptsWithPayments: any
  ) => {
    setIsSaving(true);

    try {
      // Prepare data to send to the server
      const paymentData = {
        branchID: branchID,
        collectDate: collectDate,
        amount: enteredTotal,
        receiptDetail: receiptsWithPayments.map((item: any) => ({
          loanID: item.loanID,
          amount: item.payAmount,
          servingTransAmount: 0,
          accountNo: "",
        })),
        userBranchID: userBranchID,
      };

      // Here you would send paymentData to your API
      const response = await fetch(
        `${API_BASE_URL}/MFReceipt/generateReceipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      // Check if the response was successful
      if (!response.ok) {
        // For error responses, first try to get the response as text
        const errorText = await response.text();
        
        Alert.alert(
          "Error",
          errorText || "An error occurred during processing"
        );
        return;
      }

      // Only parse as JSON if the response was successful
      const responseData = await response.text();
      // console.log("API Response:", responseData);

      const successMessage = `Total amount of Receipt No ${responseData} and payments saved successfully.`;
      Alert.alert("Success", successMessage);
    } catch (err: any) {
      // This catches network errors or JSON parsing errors
      Alert.alert("Error", err.message || "An unexpected error occurred");
      // console.error("Error saving payment data:", err);
    } finally {
      setIsSaving(false);
    }
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
              keyExtractor={(item) => item.LoanNo}
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
          {/* <TotalPayAmountDisplay /> */}
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
    backgroundColor: "#F8F1F", // Fixed typo in color
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
    shadowColor: "black",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 2,
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
  totalPayAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 10,
  },
  totalPayAmountLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  totalPayAmountValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4D90FE",
  },
  amountMismatch: {
    color: "#FF3B30",
  },
  amountMatch: {
    color: "#34C759",
  },
});

export default MFReceiptList;
