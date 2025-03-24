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
  id: number;
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
          autoCapitalize="none"
          value={payAmount}
          keyboardType="decimal-pad"
          onChangeText={(text) => setPayAmount(text.replace(/[^0-9.]/g, ""))}
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
  const { branchID, collectDate, userBranchID, CenterID, GroupID } = params;

  // State variables
  const [totalAmount, setTotalAmount] = useState<string>("0");
  const [isPayModalVisible, setPayModalVisible] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(
    null
  );
  const [payAmount, setPayAmount] = useState<string>("");
  const [receiptData, setReceiptData] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<boolean>(false);
  const [centerID, setCenterID] = useState(params.CenterID || 0);
  const [groupID, setGroupID] = useState(params.GroupID || "");

  // Update centerID and groupID when params change
  useEffect(() => {
    setCenterID(params.CenterID || 0);
    setGroupID(params.GroupID || "");
  }, [params.CenterID, params.GroupID]);

  // Fetch data on component mount or when centerID/groupID changes
  useEffect(() => {
    if (centerID && groupID) {
      refreshData();
    }
  }, [centerID, groupID]);

  // Handle initial data fetch
  useEffect(() => {
    if (receiptDataParam) {
      try {
        const parsedData = JSON.parse(receiptDataParam as string);
        setReceiptData(parsedData);
        setIsLoading(false);
      } catch (error) {
        // console.error("Failed to parse receipt data:", error);
        // setError("Failed to parse receipt data. Please try again.");
        setIsLoading(false);
      }
    } else {
      refreshData(); // Fetch data from the API if no params are passed
    }
  }, [receiptDataParam]);

  // Refresh data function
  const  refreshData = async () => {
    // setApiStatus("loading");
    setIsRefreshing(true);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/MFReceipt/getLoanDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CenterID: centerID,
          GroupID: groupID,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // console.log(data);

      setReceiptData(data);
      // setApiStatus("success");
    } catch (error) {
      // setApiStatus("error");
      setError("Failed to fetch receipt data. Please try again.");
      Alert.alert("Error", "Failed to fetch receipt data. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle pay amount entry
  const handlePayAmountEnter = async () => {
    if (!selectedReceipt) return;
    if (!payAmount || parseFloat(payAmount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid payment amount.");
      return;
    }
    setIsUpdatingPayment(true);
    // Validate payAmount
    const paymentAmount = parseFloat(payAmount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid payment amount.");
      return;
    }

    try {
      // Update only the payAmount for the selected receipt
      const updatedReceipts = receiptData.map((receipt) =>
        receipt.loanID === selectedReceipt.loanID
          ? {
              ...receipt,
              payAmount: paymentAmount, // Update payAmount only
            }
          : receipt
      );

      setReceiptData(updatedReceipts);
      setPayModalVisible(false);
      setPayAmount("");
      setSelectedReceipt(null);
      // Alert.alert("Success", "Payment amount updated successfully.");
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

  // Handle total amount change
  const handleTotalAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    setTotalAmount(numericValue);
  };
  useEffect(() => {
    refreshData();
  }, [centerID, groupID, receiptDataParam]);

  // Handle save
  const handleSave = async () => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid total amount.");
      return;
    }

    const receiptsWithPayments = receiptData.filter(
      (item) => item.payAmount !== undefined && item.payAmount !== null
    );

    const totalPayAmount = receiptsWithPayments.reduce(
      (sum, item) => sum + (item.payAmount || 0),
      0
    );

    const enteredTotal = parseFloat(totalAmount);

    if (receiptsWithPayments.length === 0) {
      Alert.alert(
        "No Payments",
        "You haven't entered any payment amounts. Would you like to proceed anyway?",
        [
          { text: "Cancel", style: "cancel" },
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
          { text: "Cancel", style: "cancel" },
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
    setTotalAmount("");

    processPayment(enteredTotal, totalPayAmount, receiptsWithPayments);
  };

  // Process payment
  const processPayment = async (
    enteredTotal: number,
    totalPayAmount: number,
    receiptsWithPayments: ReceiptItem[]
  ) => {
    setIsSaving(true);

    try {
      const paymentData = {
        branchID: branchID,
        collectDate: collectDate,
        amount: enteredTotal,
        receiptDetail: receiptsWithPayments.map((item) => ({
          loanID: item.loanID,
          amount: item.payAmount,
          servingTransAmount: 0,
          accountNo: "",
        })),
        userBranchID: userBranchID,
      };

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

      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert(
          "Error",
          errorText || "An error occurred during processing"
        );
        return;
      }

      const responseData = await response.text();
      Alert.alert(
        "Success",
        `Total amount of Receipt No ${responseData} and payments saved successfully.`
      );
      refreshData();
    } catch (err: any) {
      Alert.alert("Error", err.message || "An unexpected error occurred");
      console.error("Error saving payment data:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No receipt data available.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
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
                onPress={refreshData}
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
                { paddingBottom: 80 },
              ]}
              ListEmptyComponent={renderEmptyList}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refreshData}
                  colors={["#4D90FE"]}
                  tintColor="#4D90FE"
                />
              }
            />
          )}
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalAmountTitle}>Total Amount</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.totalAmountInput}
                placeholder="Enter total amount"
                value={totalAmount}
                onChangeText={handleTotalAmountChange}
                editable={!isSaving}
                keyboardType="decimal-pad"
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
    padding: 12,
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
