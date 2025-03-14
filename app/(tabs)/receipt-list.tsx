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
// import authUtils from "@/app/utils/authUtils";

// Define types
type ReceiptItem = {
  id: string;
  name: string;
  rentalAmount: number;
  payAmount?: number;
  due: number;
};

interface ReceiptItemComponentProps {
  item: ReceiptItem; // Use the existing ReceiptItem type
  onPress: () => void; // onPress is a function with no arguments and no return value
}

interface PayModalComponentProps {
  isVisible: boolean;
  onClose: () => void;
  selectedReceipt: ReceiptItem | null;
  payAmount: string;
  setPayAmount: (value: string) => void;
  isUpdatingPayment: boolean;
  onPayAmountEnter: () => void;
}

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
      <Text style={styles.receiptId}>{item.id}</Text>
      <Text style={styles.receiptName}>{item.name}</Text>
    </View>
    <View style={styles.receiptBody}>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Rental Amount</Text>
        <Text style={styles.rentalAmountValue}>
          {item.rentalAmount.toLocaleString()}
        </Text>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Due Amount</Text>
        <Text style={styles.dueAmountValue}>{item.due.toLocaleString()}</Text>
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
          {selectedReceipt ? selectedReceipt.id : ""}
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
  const [totalAmount, setTotalAmount] = useState<string>("600000");
  const [isPayModalVisible, setPayModalVisible] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(
    null
  );
  const [payAmount, setPayAmount] = useState<string>("");
  const [receiptData, setReceiptData] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<boolean>(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchReceiptData();
  }, []);

  const fetchReceiptData = async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const sampleData: ReceiptItem[] = [
        {
          id: "CK00000001222",
          name: "Saman Perera",
          rentalAmount: 100000,
          payAmount: 20000,
          due: 0,
        },
        {
          id: "CK0000000124412",
          name: "Saman Perera",
          rentalAmount: 100000,
          payAmount: 20000,
          due: 0,
        },
        {
          id: "CK0000r012212",
          name: "Saman Perera",
          rentalAmount: 100000,
          payAmount: 20000,
          due: 0,
        },
        {
          id: "CK000000012213",
          name: "Kamal Silva",
          rentalAmount: 100000,
          due: 300000,
        },
        {
          id: "CK000000012214",
          name: "Nimal Fernando",
          rentalAmount: 100000,
          payAmount: 20000,
          due: 0,
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
      const updatedReceipts = receiptData.map((receipt) =>
        receipt.id === selectedReceipt.id
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
      await new Promise((resolve) => setTimeout(resolve, 0));
      // console.log("Total Amount Saved:", totalAmount);
      Alert.alert("Success", "Total amount saved successfully.");
    } catch (err) {
      Alert.alert("Error", "Failed to save total amount. Please try again.");
      console.error("Error saving total amount:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // check if the user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      // const token = await authUtils.getUserToken();
      // if (!token) {
      //   router.push("/");
      // }
    };

    checkAuth();
  }, []);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      

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
                  setPayModalVisible(true);
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          style={styles.footerContainer}
        >
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
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
    paddingBottom: 80,
  },
  receiptItem: {
    backgroundColor: "white",
    borderRadius: 12,
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
  },
  payAmountText: {
    fontSize: 14,
    color: "#4D90FE",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 14,
    borderTopColor: "#E0E0E0",
    borderTopWidth: 1,
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
    padding: 12,
    // backgroundColor: "#4D90FE",
    borderRadius: 8,
    // color: "#4D90FE",

  },
  savingButton: {
    backgroundColor: "#A0C4FF",
  },
  saveButtonText: {
    fontSize: 14,
    color: "#4D90FE",
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
    // backgroundColor: "#FF3B30",
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
