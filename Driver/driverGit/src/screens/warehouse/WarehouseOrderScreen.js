import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const WarehouseOrderScreen = ({ route }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const navigation = useNavigation();
  const { WarehouseID, StaffID } = route.params;

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/warehouse-new-orders`, {
        params: { warehouseId: WarehouseID }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
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

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  const handleTransferOrder = async (orderId) => {
    try {
      await axios.post(`${API_URL}/update-tracking`, {
        orderId,
        staffId: StaffID,
        status: 'Chờ chuyển kho'
      });
      fetchOrders();
      Alert.alert('Thành công');
    } catch (error) {
      console.error('Lỗi khi chuyển đơn:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handleAssignToDriver = async (orderId, driverId) => {
    try {
      await axios.post(`${API_URL}/orders/${orderId}/assign`, {
        StaffID: driverId,
        warehouseId: WarehouseID
      });
      Alert.alert('Thành công', 'Đã phân bố đơn hàng cho tài xế');
      setExpandedOrderId(null);
      fetchOrders();
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Phân bố không thành công');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 0) {
      return order.Order_status === 'Mới tạo' &&
        order.latest_tracking_status === 'Đã tiếp nhận';
    } else {
      return order.Order_status === 'Mới tạo' &&
        order.latest_tracking_status === 'Chờ chuyển kho';
    }
  });

  const renderItem = ({ item }) => (
    <View style={[styles.card]}>
        <Text style={styles.orderCode}>📦 #{item.Order_code}</Text>
        <Text style={styles.infoText}>⏱️ Ngày đến kho: {item.latest_tracking_timestamp && new Date(item.latest_tracking_timestamp).toLocaleDateString('vi-VN')}</Text>
        <Text style={styles.infoText}>Địa chỉ gửi: {item.Sender_address}</Text>
        <Text style={styles.infoText}>Địa chỉ nhận: {item.Receiver_address}</Text>
        <Text style={styles.infoText}>💰 Phí vận chuyển: {parseFloat(item.Ship_cost).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND</Text>
        <Text style={styles.infoText}>🚚 Dịch vụ: {item.Service_name}</Text>

      {activeTab === 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton]}
            onPress={() => handleTransferOrder(item.OrderID)}
          >
            <Text style={styles.buttonText}>Chuyển kho</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton]}
            onPress={() => setExpandedOrderId(expandedOrderId === item.OrderID ? null : item.OrderID)}
          >
            <Text style={styles.buttonText}>Phân bố ▼</Text>
          </TouchableOpacity>
        </View>
      )}

      {expandedOrderId === item.OrderID && (
        <View style={styles.driversList}>
          {drivers.map(driver => (
            <TouchableOpacity
              key={driver.StaffID}
              style={styles.driverItem}
              onPress={() => handleAssignToDriver(item.OrderID, driver.StaffID)}
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
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={styles.tabText}>Đơn đến kho ({orders.filter(o => o.Order_status === 'Mới tạo' && o.latest_tracking_status === 'Đã tiếp nhận').length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={styles.tabText}>Đơn cần chuyển kho ({orders.filter(o => o.Order_status === 'Mới tạo' && o.latest_tracking_status === 'Chờ chuyển kho').length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.OrderID.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 0 ? 'Không có đơn hàng mới' : 'Không có đơn cần chuyển kho'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 5,
    borderColor: '#FFD54F',
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3498db',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#34495e',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#FFD54F',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  driversList: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  driverItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default WarehouseOrderScreen;