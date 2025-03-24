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
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Define types
type ReceiptItem = {
  id: number;
  loanID: number;
  LoanNo: any;
  CenterName: string;
  Status: string;
  logDate: string;
  payAmount?: number;
  amount: number;
  ReceiptNo: string;
  CustName: string;
};

interface ReceiptItemComponentProps {
  item: ReceiptItem;
  onPress: () => void;
}

// Receipt Item Component
const ReceiptItemComponent: React.FC<ReceiptItemComponentProps> = ({
  item,
  onPress,
}) => {
  // Format date and time from logDate
  const logDate = new Date(item.logDate);
  const formattedDate = logDate.toISOString().split("T")[0];
  const formattedTime = logDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <TouchableOpacity style={styles.receiptItem} activeOpacity={0.7}>
      <View style={styles.receiptHeader}>
        <View style={styles.receiptHeaderLeft}>
          <Text style={styles.receiptId}>Loan No: {item.LoanNo}</Text>
          <Text style={styles.receiptName}>{item.CenterName}</Text>
        </View>
        <View style={styles.receiptHeaderRight}>
          <Text style={styles.receiptDate}>{formattedDate}</Text>
          <Text style={styles.receiptTime}>{formattedTime}</Text>
          <Text style={styles.receiptNumber}>{item.CustName}</Text>
        </View>
      </View>

      <View style={styles.receiptBody}>
        <View style={styles.infoContainer}>
          <View style={styles.amountContainer}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={styles.amountValue}>
              {item.amount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            {/* <Text style={styles.infoLabel}>Status:</Text> */}
            <View
              style={[
                styles.statusBadge,
                item.Status === "Pending"
                  ? styles.pendingBadge
                  : styles.defaultBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.Status === "Pending"
                    ? styles.pendingText
                    : styles.defaultText,
                ]}
              >
                {item.Status}
              </Text>
            </View>
          </View>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={onPress}
          style={styles.cancelButtonStyle}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="archive-cancel-outline"
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
interface PayModalComponentProps {
  isVisible: boolean;
  onClose: () => void;
  id: number;
  selectedReceipt: ReceiptItem | null;
  payAmount: string;
  setPayAmount: (value: string) => void;
  isUpdatingPayment: boolean;
  onPayAmountEnter: () => void;
}

// Pay Modal Component
const PayModalComponent: React.FC<PayModalComponentProps> = ({
  isVisible,
  id, // Receive the id
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
          <Text style={styles.modalTitle}>
            Do you want to cancel the receipt?
          </Text>
          {!isUpdatingPayment && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.modalBody}>
          <View style={styles.receiptDetails}>
            <Text style={styles.modalReceiptId}>
              Loan: {selectedReceipt ? selectedReceipt.LoanNo : ""}
            </Text>
            <Text style={styles.modalReceiptId}>
              ID: {id} {/* Display the id */}
            </Text>
            <Text style={styles.modalCenter_CustName}>
              {selectedReceipt ? selectedReceipt.CenterName : ""}
            </Text>
            <Text>{selectedReceipt ? selectedReceipt.CustName : ""}</Text>
          </View>

          <Text>Enter reason</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter reason"
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
              <Text style={styles.enterButtonText}>Confirm Cancel</Text>
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
    </View>
  </Modal>
);

const MFReceiptList: React.FC = () => {
  // Get params from router
  const params = useLocalSearchParams();
  const { receiptData: receiptDataParam } = params;
  const { CenterID, dtoDate } = params;

  // State variables
  const [postedAmount, setPostedAmount] = useState<string>("0");
  const [pendingAmount, setPendingAmount] = useState<string>("0");
  const [isPayModalVisible, setPayModalVisible] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(
    null
  );
  const [payAmount, setPayAmount] = useState<string>("");
  const [receiptData, setReceiptData] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<boolean>(false);
  const [centerID, setCenterID] = useState(params.CenterID || 0);
  const [date, setDTODate] = useState(params.dtoDate || 0);

  // Update centerID and date when params change
  useEffect(() => {
    setCenterID(CenterID);
    setDTODate(dtoDate);
    console.log("Fetching data on component", date, CenterID);
  }, [params.CenterID, params.dtoDate]);

  // Handle initial data fetch
  useEffect(() => {
    if (receiptDataParam) {
      try {
        const parsedData = JSON.parse(receiptDataParam as string);
        setReceiptData(parsedData);

        // Calculate total amount

        // Filter items separately for "Posted" and "Pending" statuses
        const postedItems = parsedData.filter(
          (item: ReceiptItem) => item.Status === "Posted"
        );
        const pendingItems = parsedData.filter(
          (item: ReceiptItem) => item.Status === "Pending"
        );

        // Calculate total for "Posted" items
        const postedTotal = postedItems.reduce(
          (sum: number, item: ReceiptItem) => sum + item.amount,
          0
        );

        // Calculate total for "Pending" items
        const pendingTotal = pendingItems.reduce(
          (sum: number, item: ReceiptItem) => sum + item.amount,
          0
        );

        // Format the totals
        setPostedAmount(postedTotal.toLocaleString());
        setPendingAmount(pendingTotal.toLocaleString());

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to parse receipt data:", error);
        setError("Failed to parse receipt data. Please try again.");
        setIsLoading(false);
      }
    } else {
      // If we need to fetch data from API later
      setIsLoading(false);
    }
  }, [receiptDataParam]);

  // handle cancelation
  const handlePayAmountEnter = () => {
    if (selectedReceipt) {
      const receiptId = selectedReceipt.id; // Get the id
      const reason = payAmount; // Get the reason

      // Call the API to cancel the receipt
      cancelReceipt(receiptId, reason);
    }
  };

  const cancelReceipt = async (receiptId: number, reason: string) => {
    try {
      setIsUpdatingPayment(true); // Show loading state
      const response = await fetch(`${API_BASE_URL}/cancel-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptId,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel receipt");
      }

      const result = await response.json();
      console.log("Receipt canceled successfully:", result);

      // Update the UI by removing the canceled receipt from the list
      setReceiptData((prevData) =>
        prevData.filter((item) => item.id !== receiptId)
      );

      // Close the modal
      setPayModalVisible(false);
      setSelectedReceipt(null);
      setPayAmount("");
    } catch (error) {
      console.error("Error canceling receipt:", error);
      Alert.alert("Error", "Failed to cancel receipt. Please try again.");
    } finally {
      setIsUpdatingPayment(false); // Hide loading state
    }
  };
  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No receipt data available</Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => console.log("Refresh")}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        {/* Main Content */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4D90FE" />
              <Text style={styles.loadingText}>Loading receipts...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <FontAwesome
                name="exclamation-circle"
                size={48}
                color="#FF3B30"
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => console.log("Retry")}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={receiptData}
              renderItem={({ item, index }) => (
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
              keyExtractor={(item, index) => index.toString()} // Use index as key (not recommended)
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={renderEmptyList}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => console.log("Refreshing data")}
                  colors={["#4D90FE"]}
                  tintColor="#4D90FE"
                />
              }
            />
          )}
        </View>

        {/* Footer with Total Amount */}
        <View style={styles.footerContainer}>
          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalAmountLabel}>Posted Amount:</Text>
            <Text style={styles.totalAmountLabel}>{postedAmount}</Text>
            <Text style={styles.totalAmountLabel}>Pending Amount:</Text>
            <Text style={styles.totalAmountValue}>{pendingAmount}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Payment Modal */}
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
        id={selectedReceipt ? selectedReceipt.id : 0} // Pass the id
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
    backgroundColor: "#F9FAFC",
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 70, // Space for footer
  },

  // List styles
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },

  // Receipt item styles
  receiptItem: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6ca1ff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
    padding: 18,
    backgroundColor: "#F7F9FF",
  },
  receiptHeaderLeft: {
    flex: 1,
  },
  receiptHeaderRight: {
    alignItems: "flex-end",
  },
  receiptId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  receiptName: {
    fontSize: 14,
    color: "#666",
  },
  receiptDate: {
    fontSize: 12,
    color: "#666",
  },
  receiptTime: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4D90FE",
  },
  receiptBody: {
    padding: 18,
  },

  amountRow: {
    flexDirection: "row", // Arrange items in a row
    justifyContent: "space-between", // Space out items evenly
    alignItems: "center", // Align items vertically
    marginBottom: 12, // Add margin at the bottom
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 15,
    color: "#666",
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4D90FE",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  payAmountContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#E8F2FF",
    borderRadius: 8,
  },
  payAmountText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4D90FE",
  },

  // Empty, loading, and error states
  emptyContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 16,
  },
  refreshButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4D90FE",
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#4D90FE",
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },

  // Footer styles
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopColor: "#E0E0E0",
    borderTopWidth: 1,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalAmountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalAmountValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4D90FE",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F9FF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  receiptDetails: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F7F9FF",
    borderRadius: 8,
  },
  modalReceiptId: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  modalCenter_CustName: {
    fontSize: 14,
    color: "#666",
  },
  modalInput: {
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#DDE6FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FCFCFC",
  },
  enterButton: {
    padding: 14,
    backgroundColor: "#4D90FE",
    borderRadius: 8,
    alignItems: "center",
  },
  updatingButton: {
    backgroundColor: "#A0C4FF",
  },
  enterButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  cancelButtonStyle: {
    position: "absolute", // Make the button absolutely positioned
    right: 2, // Adjust the left position as needed
    bottom: 2, // Adjust the top position as needed
    zIndex: 1, // Ensure the button is above other elements
    padding: 1,
  },
  // Add these to your existing styles object
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
    marginRight: 5,
  },
  // amountValue: {
  //   fontSize: 16,
  //   fontWeight: '600',
  //   color: '#333',
  // },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendingBadge: {
    backgroundColor: "#FFA500",
  },
  defaultBadge: {
    backgroundColor: "#07e71e",
  },
  statusText: {
    fontSize: 15,
    fontWeight: "500",
  },
  pendingText: {
    color: "white",
  },
  defaultText: {
    color: "white",
  },
});

export default MFReceiptList;
