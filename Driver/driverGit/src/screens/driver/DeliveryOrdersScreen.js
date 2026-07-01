import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import API_URL from '../../config/apiconfig';

const DeliveryOrdersScreen = ({ route }) => {
  const { StaffID, initialTab = 0 } = route.params;
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/drivers/${StaffID}/assigned-orders`);
      const allOrders = response.data;
      setRawData(allOrders);

      const mainOrders = allOrders.filter(order =>
        order.Order_status === 'Mới tạo' &&
        order.Tracking_status === 'Đang vận chuyển'
      );

      const uniqueOrders = Object.values(
        mainOrders.reduce((acc, item) => {
          if (!acc[item.OrderID] || new Date(item.Timestamp) > new Date(acc[item.OrderID].Timestamp)) {
            acc[item.OrderID] = item;
          }
          return acc;
        }, {})
      );

      setOrders(uniqueOrders);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStartDelivery = async (order) => {
    try {
      await axios.put(`${API_URL}/orders/${order.id || order.OrderID}/status`, {
        newStatus: 'Đang giao',
        staffId: StaffID
      });

      navigation.navigate('DeliveryDetailScreen', {
        order: {
          OrderID: order.OrderID,
          Order_code: order.Order_code,
          receiver_name: order.Receiver_name,
          receiver_address: order.Receiver_address,
          receiver_phone: order.Receiver_phone,
          Weight: order.Weight,
          Ship_cost: order.Ship_cost,
          Service_name: order.Service_name,
        },
        StaffID
      });
    } catch (error) {
      console.error('Lỗi khi bắt đầu giao hàng:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu giao hàng');
    }
  };


  const todayOrders = orders.filter(order => {
    const assignedDate = new Date(order.Timestamp);
    const today = new Date();

    return (
      assignedDate.getDate() === today.getDate() &&
      assignedDate.getMonth() === today.getMonth() &&
      assignedDate.getFullYear() === today.getFullYear()
    );
  });

  const previousOrders = orders.filter(order => {
    const assignedDate = new Date(order.Timestamp);
    const today = new Date();

    return (
      assignedDate.getDate() !== today.getDate() ||
      assignedDate.getMonth() !== today.getMonth() ||
      assignedDate.getFullYear() !== today.getFullYear()
    );
  });

const failedOrders = Object.values(
  rawData
    .filter(item => item.Order_status === 'Thất bại')
    .reduce((acc, item) => {
      const allOrderRecords = rawData.filter(x => x.OrderID === item.OrderID);

      const latestWithNotes = [...allOrderRecords]
        .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
        .find(x => x.Tracking_notes) || item;

      if (!acc[item.OrderID] || new Date(latestWithNotes.Timestamp) > new Date(acc[item.OrderID].Timestamp)) {
        acc[item.OrderID] = {
          ...latestWithNotes,
          Tracking_notes: latestWithNotes.Tracking_notes || 'Không có thông tin'
        };
      }
      return acc;
    }, {})
);

console.log('All records for order 15:', 
  rawData.filter(x => x.OrderID === 15).map(x => ({
    time: x.Timestamp,
    notes: x.Tracking_notes,
    status: x.Tracking_status
  }))
);

  const renderOrderItem = (item, isFailed = false) => (
    <View style={[styles.orderCard, isFailed && styles.failedOrderCard]}>
      <Text style={styles.orderCode}>Đơn hàng #{item.Order_code || item.order_code}</Text>
      <Text style={styles.receiverInfo}>👤Người nhận: {item.Receiver_name}</Text>
      <Text style={styles.receiverInfo}>📍Địa chỉ giao: {item.Receiver_address}</Text>
      <Text style={styles.receiverInfo}>📦 Dịch vụ: {item.Service_name}</Text>
      <Text style={styles.receiverInfo}>🏭 Kho xuất phát: {item.Warehouse_name || 'Không xác định'}</Text>
      {isFailed && (
        <Text style={styles.returnReason}>❗ Lý do: {item.Tracking_notes || 'Không có thông tin'}</Text>
      )}

      <View style={styles.assignButtonWrapper}>
        <TouchableOpacity
          onPress={() => handleStartDelivery(item)}
          style={isFailed ? styles.buttonRetry : styles.buttonStart}
        >
          <Text style={styles.assignButtonText}>
            {isFailed ? 'GIAO LẠI' : 'BẮT ĐẦU GIAO'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <Text style={styles.tabHeader}>ĐƠN HÔM NAY ({todayOrders.length})</Text>
            {todayOrders.length > 0 ? (
              todayOrders.map((item, index) => (
                <View key={index}>
                  {renderOrderItem(item)}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có đơn hàng nào hôm nay</Text>
            )}
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.tabHeader}>ĐƠN NGÀY TRƯỚC ({previousOrders.length})</Text>
            {previousOrders.length > 0 ? (
              previousOrders.map((item, index) => (
                <View key={index}>
                  {renderOrderItem(item)}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có đơn hàng ngày trước</Text>
            )}
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.tabHeader}>ĐƠN THẤT BẠI ({failedOrders.length})</Text>
            {failedOrders.length > 0 ? (
              failedOrders.map((item, index) => (
                <View key={index}>
                  {renderOrderItem(item, true)}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có đơn hàng thất bại</Text>
            )}
          </>
        );
      default:
        return null;
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={styles.tabText}>HÔM NAY ({todayOrders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={styles.tabText}>NGÀY TRƯỚC ({previousOrders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 2 && styles.activeTab]}
          onPress={() => setActiveTab(2)}
        >
          <Text style={styles.tabText}>THẤT BẠI ({failedOrders.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.tabContent}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  tabButton: {
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#FFD54F'
  },
  tabText: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 12,
    textAlign: 'center'
  },
  tabContent: {
    flex: 1,
    padding: 15
  },
  tabHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50'
  },
  orderCard: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    marginBottom: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 5,
    borderColor: '#FFD54F',
    position: 'relative'
  },
  failedOrderCard: {
    borderColor: '#F44336',
    backgroundColor: '#E0E0E0'
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#3498db'
  },
  receiverInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555'
  },
  returnReason: {
    fontSize: 14,
    marginTop: 8,
    color: '#e74c3c',
    fontStyle: 'italic'
  },
  assignButtonWrapper: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 1,
  },
  assignButtonText: {
    color: '#FAFAFA',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d'
  },
  buttonStart: {
    backgroundColor: '#FFD54F',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  buttonRetry: {
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  }
});

export default DeliveryOrdersScreen;