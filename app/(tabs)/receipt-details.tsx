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
  CenterName: string;
  Status: string;
  logDate: string;
  payAmount?: number;
  amount: number;
  ReceiptNo: string;
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
    <TouchableOpacity
      style={styles.receiptItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.receiptHeader}>
        <View style={styles.receiptHeaderLeft}>
          <Text style={styles.receiptId}>Loan No: {item.LoanNo}</Text>
          <Text style={styles.receiptName}>{item.CenterName}</Text>
        </View>
        <View style={styles.receiptHeaderRight}>
          <Text style={styles.receiptDate}>{formattedDate}</Text>
          <Text style={styles.receiptTime}>{formattedTime}</Text>
          <Text style={styles.receiptNumber}>#{item.ReceiptNo}</Text>
        </View>
      </View>

      <View style={styles.receiptBody}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount:</Text>
          <Text style={styles.amountValue}>{item.amount.toLocaleString()}</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Status:</Text>
          <Text style={styles.statusValue}>{item.Status}</Text>
        </View>

        {item.payAmount !== undefined && (
          <View style={styles.payAmountContainer}>
            <Text style={styles.payAmountText}>
              Pay Amount: {item.payAmount.toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

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
            <Text style={styles.modalCenterName}>
              {selectedReceipt ? selectedReceipt.CenterName : ""}
            </Text>
          </View>

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
    </View>
  </Modal>
);

const MFReceiptList: React.FC = () => {
  // Get params from router
  const params = useLocalSearchParams();
  const { receiptData: receiptDataParam } = params;
  const { CenterID, dtoDate } = params;

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
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<boolean>(false);
  const [centerID, setCenterID] = useState(params.CenterID || 0);
  const [date, setDTODate] = useState(params.dtoDate || 0);

  // Handle pay amount enter
  const handlePayAmountEnter = () => {
    // Add your payment logic here
    console.log(
      `Entering payment of ${payAmount} for loan ${selectedReceipt?.LoanNo}`
    );
    setPayModalVisible(false);
  };

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
        const total = parsedData.reduce(
          (sum: number, item: ReceiptItem) => sum + item.amount,
          0
        );
        setTotalAmount(total.toLocaleString());

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
            <Text style={styles.totalAmountLabel}>Total Amount:</Text>
            <Text style={styles.totalAmountValue}>{totalAmount}</Text>
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
    borderColor: "#DDE6FF",
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
    padding: 16,
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
    padding: 16,
  },
  amountRow: {
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
  modalCenterName: {
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
});

export default MFReceiptList;
