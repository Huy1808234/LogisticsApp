import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';
import { useRoute } from '@react-navigation/native';
const DriverAssignedOrders = () => {
  const { StaffID } = useRoute().params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/drivers/${StaffID}/assigned-orders`);
      const latestTrackingOrders = response.data.reduce((acc, current) => {
        const existingOrder = acc.find(item => item.OrderID === current.OrderID);
        
        if (!existingOrder || new Date(current.Timestamp) > new Date(existingOrder.Timestamp)) {
          return [...acc.filter(item => item.OrderID !== current.OrderID), current];
        }
        return acc;
      }, []);

      const filteredOrders = latestTrackingOrders.filter(order => 
        order.Order_status === 'Mới tạo' && 
        ['Cần lấy', 'Đang lấy', 'Đã lấy', 'Lấy thất bại','Đang vận chuyển'].includes(order.Tracking_status)
      );
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Cần lấy': return '#FFA000';
      case 'Đang lấy': return '#2196F3';
      case 'Đã lấy': return '#4CAF50';
      case 'Đang vận chuyển': return '#673AB7';
      case 'Lấy thất bại': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

const renderItem = ({ item }) => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <Text style={styles.orderCode}>#{item.Order_code}</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.Tracking_status) }]}>
        <Text style={styles.statusText}>{item.Tracking_status}</Text>
      </View>
    </View>
    
    <Text style={styles.receiverInfo}>👤 Người nhận: {item.Receiver_name}</Text>
    <Text style={styles.receiverInfo}>📞 SĐT: {item.Receiver_phone}</Text>
    <Text style={styles.receiverInfo}>📍Nơi nhận: {item.Receiver_address}</Text>
    <Text style={styles.receiverInfo}>📦 {item.Service_name} - {item.Weight}kg</Text>
    <Text style={styles.receiverInfo}>🏭 Từ Kho: {item.Warehouse_name}</Text>
    <Text style={styles.timestampText}>🕒 {new Date(item.Timestamp).toLocaleString()}</Text>
    
    {item.Tracking_notes && (
      <Text style={styles.notesText}>📝 Ghi chú: {item.Tracking_notes}</Text>
    )}
  </View>
);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => `order-${item.OrderID}-${item.Timestamp}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có đơn hàng nào được giao</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5'
  },
  orderCard: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3498db'
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center'
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  receiverInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5
  },
  timestampText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5
  },
  notesText: {
    fontSize: 13,
    color: '#E91E63',
    marginTop: 5,
    fontStyle: 'italic'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#7f8c8d'
  },
  listContainer: {
    paddingBottom: 20
  }
});

export default DriverAssignedOrders;