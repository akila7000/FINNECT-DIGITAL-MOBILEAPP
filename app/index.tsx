import React from "react";
import { Text, View, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <ImageBackground
        // source={{ uri: "/api/placeholder/800/1600" }}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>FINNET</Text>
            <Text style={styles.logoDigital}>DIGITAL</Text>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.tagline}>Smart Financial Solutions</Text>
            <Text style={styles.description}>
              Manage your finances, investments, and payments all in one secure platform.
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon} />
                <Text style={styles.featureText}>Secure Transactions</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon} />
                <Text style={styles.featureText}>Investment Tracking</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon} />
                <Text style={styles.featureText}>24/7 Support</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.getStartedButton}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 20, 50, 0.8)",
    padding: 20,
    justifyContent: "space-between",
  },
  headerContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  logoDigital: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4D90FE",
    letterSpacing: 3,
    marginTop: -5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 80,
  },
  tagline: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 50,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4D90FE",
    marginRight: 14,
  },
  featureText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  getStartedButton: {
    backgroundColor: "#4D90FE",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 20,
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});