import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const ActiveOrderScreen = ({ route }) => {
  const { StaffID } = route.params;
  const navigation = useNavigation();
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/drivers/${StaffID}/assigned-orders`);

      // Lọc tất cả đơn "Đang giao" và lấy đơn mới nhất
      const activeOrders = response.data.filter(order =>
        order.Order_status === 'Đang giao'
      );

      // Nếu có nhiều đơn, lấy đơn có Timestamp mới nhất
      const latestActiveOrder = activeOrders.length > 0
        ? activeOrders.reduce((latest, current) =>
          new Date(current.Timestamp) > new Date(latest.Timestamp) ? current : latest
        )
        : null;

      setActiveOrder(latestActiveOrder);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng đang giao:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchActiveOrder();
    }, [])
  );

  useEffect(() => {
    if (!loading && activeOrder) {
      navigation.navigate('DeliveryDetailScreen', {
        order: {
          OrderID: activeOrder.OrderID,
          Order_code: activeOrder.Order_code,
          receiver_name: activeOrder.Receiver_name,
          receiver_address: activeOrder.Receiver_address,
          receiver_phone: activeOrder.Receiver_phone,
          Weight: activeOrder.Weight,
          Service_name: activeOrder.Service_name,
          Ship_cost: activeOrder.Ship_cost

        },
        StaffID
      });
    }
  }, [activeOrder, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚚 ĐƠN HÀNG ĐANG GIAO</Text>

      {!activeOrder ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có đơn hàng nào đang giao</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Đang chuyển đến đơn hàng...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#2c3e50'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20
  },
  backButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default ActiveOrderScreen;
