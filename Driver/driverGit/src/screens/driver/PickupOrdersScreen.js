import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const { width } = Dimensions.get('window');

const PickupOrdersScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [failedOrders, setFailedOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [expandedWarehouseDropdown, setExpandedWarehouseDropdown] = useState(false);
  const StaffID = route.params.StaffID;
  const tabPosition = useState(new Animated.Value(0))[0];

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await axios.get(`${API_URL}/driver-all-pickup-orders`, {
        params: { driverId: StaffID }
      });

      const pendingOrders = response.data.filter(
        order => order.tracking_status === 'Cần lấy'
      );
      const completedOrders = response.data.filter(
        order => order.tracking_status === 'Đã lấy'
      );
      const failedOrders = response.data.filter(
        order => order.tracking_status === 'Lấy thất bại'
      ).map(order => ({
        ...order,
        Notes: order.tracking_notes
      }));

      setPendingOrders(pendingOrders);
      setCompletedOrders(completedOrders);
      setFailedOrders(failedOrders);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await axios.get(`${API_URL}/warehouses`);
        setWarehouses(response.data);
      } catch (error) {
        console.error('Lỗi tải kho:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách kho');
      }
    };

    fetchWarehouses();
  }, []);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    Animated.spring(tabPosition, {
      toValue: tabIndex,
      useNativeDriver: true,
    }).start();
  };

  const handleStartPickup = async (order) => {
    try {
      await axios.post(`${API_URL}/update-tracking`, {
        orderId: order.OrderID,
        staffId: StaffID,
        status: 'Đang lấy'
      });
      navigation.navigate('PickupDetailScreen', {
        order: {
          OrderID: order.OrderID,
          Order_code: order.Order_code,
          Sender_name: order.Sender_name,
          Sender_phone: order.Sender_phone,
          Sender_address: order.Sender_address,
          Service_name: order.Service_name
        },
        StaffID
      });
      fetchAllData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể bắt đầu lấy đơn');
    }
  };

  const handleDeliverToWarehouse = async (orderId) => {
    if (!selectedWarehouse) {
      Alert.alert('Lỗi', 'Vui lòng chọn kho nhận hàng');
      return;
    }

    try {
      await axios.post(`${API_URL}/deliver-to-warehouse`, {
        orderId,
        warehouseId: selectedWarehouse,
        staffId: StaffID
      });
      Alert.alert('Thành công', 'Đơn hàng đã được giao cho kho');
      fetchAllData();
    } catch (error) {
      console.error('Lỗi giao kho:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể giao đơn cho kho');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const renderOrderItem = (item, isCompleted = false, isFailed = false) => (
    <View style={[
      styles.orderCard,
      isCompleted && styles.completedOrderCard,
      isFailed && styles.failedOrderCard
    ]}>
      <Text style={styles.orderCode}>Đơn hàng #{item.Order_code || item.order_code}</Text>
      <Text style={styles.senderInfo}>👤 Người gửi: {item.Sender_name}</Text>
      <Text style={styles.senderInfo}>📍 Địa chỉ: {item.Sender_address}</Text>
      <Text style={styles.senderInfo}>📦 Dịch vụ: {item.Service_name}</Text>
      {isFailed && (
        <Text style={styles.failureReason}>
          ❗ Lý do: {item.tracking_notes || item.Notes || 'Không có thông tin'}
        </Text>
      )}

      <View style={styles.assignButtonWrapper}>
        <TouchableOpacity
          onPress={() => {
            if (isCompleted) {
              handleDeliverToWarehouse(item.OrderID);
            } else if (isFailed) {
              handleStartPickup(item);
            } else {
              handleStartPickup(item);
            }
          }}
          style={[
            isCompleted ? styles.buttonDeliver :
              isFailed ? styles.buttonRetry : styles.buttonStart
          ]}
        >
          <Text style={styles.assignButtonText}>
            {isCompleted ? 'GIAO CHO KHO' :
              isFailed ? 'LẤY LẠI' : 'BẮT ĐẦU LẤY'}
          </Text>
        </TouchableOpacity>
      </View>
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
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 0 && styles.activeTab]}
          onPress={() => handleTabChange(0)}
        >
          <Text style={styles.tabText}>CẦN LẤY ({pendingOrders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 1 && styles.activeTab]}
          onPress={() => handleTabChange(1)}
        >
          <Text style={styles.tabText}>ĐÃ LẤY ({completedOrders.length})</Text>
        </TouchableOpacity>
        {/* Thêm tab THẤT BẠI */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 2 && styles.activeTab]}
          onPress={() => handleTabChange(2)}
        >
          <Text style={styles.tabText}>THẤT BẠI ({failedOrders.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.tabContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAllData} />
        }
      >
        {activeTab === 0 ? (
          <>
            <Text style={styles.tabHeader}>ĐƠN CẦN LẤY ({pendingOrders.length})</Text>
            {pendingOrders.length > 0 ? (
              pendingOrders.map((item, index) => (
                <View key={index}>
                  {renderOrderItem(item)}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có đơn nào cần lấy</Text>
            )}
          </>
        ) : activeTab === 1 ? (
          <>
            <View style={styles.warehouseSelector}>
              <TouchableOpacity
                style={styles.dropdownToggle}
                onPress={() =>
                  setExpandedWarehouseDropdown((prev) => !prev)
                }
              >
                <Text style={styles.dropdownText}>
                  {selectedWarehouse
                    ? warehouses.find(w => w.WarehouseID === selectedWarehouse)?.Name
                    : 'Chọn kho đã giao đến'} ▼
                </Text>
              </TouchableOpacity>

              {expandedWarehouseDropdown && (
                <View style={styles.dropdownMenu}>
                  {warehouses.map(warehouse => (
                    <TouchableOpacity
                      key={warehouse.WarehouseID}
                      style={styles.driverOption}
                      onPress={() => {
                        setSelectedWarehouse(warehouse.WarehouseID);
                        setExpandedWarehouseDropdown(false);
                      }}
                    >
                      <Text>{warehouse.Name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.tabHeader}>ĐƠN ĐÃ LẤY ({completedOrders.length})</Text>
            {completedOrders.length > 0 ? (
              completedOrders.map((item, index) => (
                <View key={index}>
                  {renderOrderItem(item, true)}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Chưa có đơn nào đã lấy</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.tabHeader}>ĐƠN LẤY THẤT BẠI ({failedOrders.length})</Text>
            {failedOrders.length > 0 ? (
              failedOrders.map((item, index) => (
                <View key={index}>
                  {renderOrderItem(item, false, true)}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Không có đơn nào lấy thất bại</Text>
            )}
          </>
        )}
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
  completedOrderCard: {
    borderColor: '#2ecc71'
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#3498db'
  },
  senderInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555'
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
  buttonDeliver: {
    backgroundColor: '#2ecc71',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  warehouseSelector: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  dropdownToggle: {
    backgroundColor: '#FFD54F',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10
  },
  dropdownText: {
    color: 'white',
    fontWeight: 'bold'
  },
  dropdownMenu: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  driverOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  failedOrderCard: {
    borderColor: '#e74c3c'
  },
  buttonRetry: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  failureReason: {
    color: '#e74c3c',
    fontStyle: 'italic',
    marginVertical: 5
  }
});

export default PickupOrdersScreen;