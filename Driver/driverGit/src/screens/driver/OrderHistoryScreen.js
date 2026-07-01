import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const OrderHistoryScreen = ({ route }) => {
  const { StaffID } = route.params;
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const fetchHistoryOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/drivers/${StaffID}/assigned-orders`);

      const ordersMap = response.data.reduce((acc, order) => {
        const existing = acc[order.OrderID];
        const currentTimestamp = new Date(order.Timestamp);
        
        if (!existing || currentTimestamp > new Date(existing.Timestamp)) {
          acc[order.OrderID] = order;
        }
        return acc;
      }, {});

      const uniqueOrders = Object.values(ordersMap).filter(order => {
        return order.Order_status === 'Hoàn thành' || order.Order_status === 'Thất bại';
      });

      setAllOrders(uniqueOrders);
      filterOrdersByMonth(uniqueOrders, new Date().getMonth());
    } catch (err) {
      console.error('Lỗi khi lấy đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByMonth = (orders, month) => {
    const currentYear = new Date().getFullYear();
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.Timestamp);
      return orderDate.getMonth() === month && orderDate.getFullYear() === currentYear;
    });
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchHistoryOrders();
  }, []);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    filterOrdersByMonth(allOrders, month);
    setShowMonthDropdown(false);
  };

  const renderOrderItem = (order, index) => (
    <View
      key={`${order.OrderID}-${index}`}
      style={[
        styles.orderCard,
        order.Order_status === 'Thất bại' && styles.failedCard
      ]}
    >
      <Text style={styles.orderCode}>📦 Mã đơn: {order.Order_code}</Text>
      <Text style={styles.info}>👤 Người nhận: {order.Receiver_name}</Text>
      <Text style={styles.info}>📍 Địa chỉ: {order.Receiver_address}</Text>
      <Text style={styles.info}>📞 SĐT: {order.Receiver_phone}</Text>
      <Text style={[
        styles.statusText,
        order.Order_status === 'Thất bại' ? { color: '#E53935' } : { color: '#4CAF50' }
      ]}>
        Trạng thái: {order.Order_status}
        {order.Order_status === 'Thất bại' && order.Tracking_notes && ` (${order.Tracking_notes})`}
      </Text>
    </View>
  );

  const getStats = (orders) => {
    return orders.reduce((acc, order) => {
      if (order.Order_status === 'Hoàn thành') acc.completed++;
      else if (order.Order_status === 'Thất bại') acc.failed++;
      return acc;
    }, { completed: 0, failed: 0 });
  };

  const monthName = (monthNumber) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(monthNumber);
    return date.toLocaleString('vi-VN', { month: 'long' });
  };

  const { completed, failed } = getStats(filteredOrders);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LỊCH SỬ GIAO HÀNG</Text>

      <View style={styles.monthSelectorContainer}>
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setShowMonthDropdown(!showMonthDropdown)}
        >
          <Text style={styles.monthSelectorText}>
            {monthName(selectedMonth).charAt(0).toUpperCase() + monthName(selectedMonth).slice(1)}
          </Text>
          <Text style={styles.monthSelectorIcon}>{showMonthDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showMonthDropdown && (
          <View style={styles.dropdownMenu}>
            <ScrollView>
              {months.map(month => (
                <TouchableOpacity
                  key={month}
                  style={styles.monthOption}
                  onPress={() => handleMonthSelect(month)}
                >
                  <Text>{monthName(month)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryText, styles.completedText]}>
            🟢 Hoàn thành: {completed}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryText, styles.failedText]}>
            🔴 Thất bại: {failed}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD54F" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {filteredOrders.length > 0 ? (
            filteredOrders
              .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
              .map(renderOrderItem)
          ) : (
            <Text style={styles.noOrdersText}>Không có đơn hàng trong tháng này</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#2c3e50',
    textAlign: 'center'
  },
  monthSelectorContainer: {
    marginBottom: 15,
    zIndex: 10
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  monthSelectorText: {
    fontSize: 16,
    color: '#444'
  },
  monthSelectorIcon: {
    fontSize: 12,
    color: '#777'
  },
  dropdownMenu: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5
  },
  monthOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  orderCard: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50'
  },
  failedCard: {
    borderLeftColor: '#F44336'
  },
  orderCode: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    color: '#3498db'
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555'
  },
  statusText: {
    marginTop: 10,
    fontWeight: 'bold'
  },
  noOrdersText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  completedText: {
    color: '#4CAF50'
  },
  failedText: {
    color: '#F44336'
  }
});

export default OrderHistoryScreen;