import React, { useState } from "react";
import { Text, View, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function ReceiptListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Sample receipt data
  const receipts = [
    { 
      id: '1', 
      merchant: 'Grocery Store', 
      amount: 84.25, 
      date: '2025-03-14', 
      category: 'Groceries',
      imageUrl: '/api/placeholder/100/100'
    },
    { 
      id: '2', 
      merchant: 'Café Delight', 
      amount: 22.50, 
      date: '2025-03-13', 
      category: 'Dining',
      imageUrl: '/api/placeholder/100/100'
    },
    { 
      id: '3', 
      merchant: 'Gas Station', 
      amount: 45.75, 
      date: '2025-03-12', 
      category: 'Transportation',
      imageUrl: '/api/placeholder/100/100'
    },
    { 
      id: '4', 
      merchant: 'Office Supplies', 
      amount: 37.99, 
      date: '2025-03-10', 
      category: 'Business',
      imageUrl: '/api/placeholder/100/100'
    },

  ];
  
  // Get the formatted date string
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Render each receipt item
  const renderReceiptItem = ({ item }) => (
    <TouchableOpacity style={styles.receiptItem}>
      <View style={styles.receiptImageContainer}>
        <View style={styles.receiptThumbnail} />
      </View>
      
      <View style={styles.receiptInfo}>
        <Text style={styles.merchantName}>{item.merchant}</Text>
        <Text style={styles.receiptDate}>{formatDate(item.date)}</Text>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      
      <View style={styles.receiptAmount}>
        <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search receipts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'groceries' && styles.activeFilterTab]}
            onPress={() => setFilter('groceries')}
          >
            <Text style={[styles.filterText, filter === 'groceries' && styles.activeFilterText]}>Groceries</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'dining' && styles.activeFilterTab]}
            onPress={() => setFilter('dining')}
          >
            <Text style={[styles.filterText, filter === 'dining' && styles.activeFilterText]}>Dining</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'transportation' && styles.activeFilterTab]}
            onPress={() => setFilter('transportation')}
          >
            <Text style={[styles.filterText, filter === 'transportation' && styles.activeFilterText]}>Transportation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'shopping' && styles.activeFilterTab]}
            onPress={() => setFilter('shopping')}
          >
            <Text style={[styles.filterText, filter === 'shopping' && styles.activeFilterText]}>Shopping</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Receipts</Text>
          <Text style={styles.summaryValue}>{receipts.length}</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryValue}>
            ${receipts.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </Text>
        </View>
      </View>
      
      {/* Receipt List */}
      <FlatList
        data={receipts}
        renderItem={renderReceiptItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Add New Receipt Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#4D90FE',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  receiptItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  receiptImageContainer: {
    marginRight: 16,
  },
  receiptThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  receiptInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(77, 144, 254, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#4D90FE',
    fontWeight: '500',
  },
  receiptAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4D90FE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});