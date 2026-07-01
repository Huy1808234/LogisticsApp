import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const AssignPickupScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchPickupOrders = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn cần lấy');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/drivers`);
      setDrivers(response.data);
    } catch (error) {
      console.error('Lỗi lấy tài xế:', error);
    }
  };

  const handleAssignPickup = async (OrderID, StaffID) => {
    try {
      await axios.post(`${API_URL}/delivery-assignments`, {
        OrderID,
        StaffID,
        IsPickup: true
      });

      Alert.alert('Thành công', 'Đã gán đơn cho tài xế đi lấy');
      setExpandedOrderId(null);
      fetchPickupOrders();
    } catch (error) {
      Alert.alert('Lỗi', 'Gán đơn thất bại');
    }
  };

  useEffect(() => {
    fetchPickupOrders();
    fetchDrivers();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardContent}>
        <Text style={styles.orderCode}>#{item.Order_code}</Text>
        <Text>Người gửi: {item.Sender_name}</Text>
        <Text>Địa chỉ: {item.Sender_address}</Text>
        <Text>SĐT: {item.Sender_phone}</Text>
      </View>

      <TouchableOpacity
        style={styles.dropdownToggle}
        onPress={() =>
          setExpandedOrderId(expandedOrderId === item.OrderID ? null : item.OrderID)
        }
      >
        <Text style={styles.dropdownText}>Gán tài xế ▼</Text>
      </TouchableOpacity>

      {expandedOrderId === item.OrderID && (
        <View style={styles.dropdownMenu}>
          {drivers.map(driver => (
            <TouchableOpacity
              key={driver.StaffID}
              style={styles.driverOption}
              onPress={() => handleAssignPickup(item.OrderID, driver.StaffID)}
            >
              <Text>{driver.Name} ({driver.Phone})</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ĐƠN CẦN LẤY TỪ NGƯỜI GỬI</Text>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item.OrderID.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPickupOrders} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có đơn nào cần lấy</Text>
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
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    textAlign: 'center'
  },
  orderCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  cardContent: {
    marginBottom: 10
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3498db',
    marginBottom: 5
  },
  dropdownToggle: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  dropdownText: {
    fontWeight: 'bold'
  },
  dropdownMenu: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5
  },
  driverOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d'
  }
});

export default AssignPickupScreen;
