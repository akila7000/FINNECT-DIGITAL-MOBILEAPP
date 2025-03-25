import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Define interfaces for our data types
interface SummaryItem {
  Branch: string;
  UserName: string;
  OpeningBalance: number;
  LeaseCashIn: number;
  MFCashIn: number;
  GLCashIn: number;
  CashBank: number;
  CashCollection: number;
}

interface MetricItem {
  label: string;
  value: number;
  key: string;
}

const SummarySheetPage = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [apiStatus, setApiStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [summaryData, setSummaryData] = useState<SummaryItem[] | null>(null);
  const [dateError, setDateError] = useState<string>("");

  useEffect(() => {
    console.log("date", date);
  }, [date]);

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setDateError("");
  };

  const fetchReceiptData = async () => {
    setApiStatus("loading");
    try {
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not defined");
      }

      const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD

      const response = await fetch(
        `${API_BASE_URL}/MFReceipt/GetCashierCashSummary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            summaryDate: formattedDate,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert("Server Error");
        throw new Error(errorText || "Failed to fetch data");
      }

      const data = await response.json();

      setSummaryData(data);
      setApiStatus("success");
    } catch (error: any) {
      setApiStatus("error");
      Alert.alert("Error", `Failed to fetch receipt data: ${error.message}`);
    }
  };

  const renderDateField = (label: string, value: Date, error: string) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View
          style={[styles.datePickerContainer, error ? styles.errorField : null]}
        >
          <DateTimePicker
            style={styles.datePicker}
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  };

  // Format currency values

  // Render each branch summary card
  const renderBranchSummary = (item: SummaryItem, index: number) => {
    // Key financial metrics to highlight
    const keyMetrics: MetricItem[] = [
      {
        label: "Opening Balance",
        value: item.OpeningBalance,
        key: "OpeningBalance",
      },
      { label: "Lease Cash In", value: item.LeaseCashIn, key: "LeaseCashIn" },
      { label: "MF Cash In", value: item.MFCashIn, key: "MFCashIn" },
      { label: "GL Cash In", value: item.GLCashIn, key: "GLCashIn" },
      { label: "Cash Bank", value: item.CashBank, key: "CashBank" },
    ];

    // Calculate total cash in hand
    const cashInHand = item.CashCollection || 0;

    return (
      <View style={styles.branchCard} key={`${item.Branch}-${index}`}>
        <View style={styles.branchHeader}>
          <Text style={styles.branchName}>{item.Branch}</Text>
          <Text style={styles.userName}>Cashier: {item.UserName}</Text>
        </View>

        <View style={styles.metricsContainer}>
          {keyMetrics.map((metric) => (
            <View style={styles.metricItem} key={metric.key}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  metric.value > 0 ? styles.positiveValue : null,
                ]}
              >
                {metric.value.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Cash In Hand:</Text>
          <Text
            style={[
              styles.totalValue,
              cashInHand > 0 ? styles.positiveValue : null,
            ]}
          >
            {cashInHand.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {renderDateField("Select Date", date, dateError)}

        <TouchableOpacity
          style={styles.fetchButton}
          onPress={fetchReceiptData}
          disabled={apiStatus === "loading"}
        >
          {apiStatus === "loading" ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Get Summary</Text>
          )}
        </TouchableOpacity>

        {apiStatus === "success" && summaryData && (
          <ScrollView style={styles.resultsContainer}>
            <Text style={styles.summaryTitle}>
              Summary Details - {date.toLocaleDateString()}
            </Text>

            {Array.isArray(summaryData) ? (
              summaryData.map((item, index) => renderBranchSummary(item, index))
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>
                  Unexpected data format received
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {apiStatus === "error" && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>
              Failed to load summary. Please try again.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  datePickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 4,
  },
  datePicker: {
    width: "100%",
    height: 40,
  },
  errorField: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
  },
  fetchButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  branchCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  branchHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
    marginBottom: 12,
  },
  branchName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },
  userName: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  metricLabel: {
    fontSize: 14,
    color: "#34495e",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  positiveValue: {
    color: "#F0CBO7",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  errorMessage: {
    color: "#c62828",
    fontSize: 14,
  },
});

export default SummarySheetPage;
