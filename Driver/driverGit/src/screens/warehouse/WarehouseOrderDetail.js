import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../config/apiconfig';

const WarehouseOrderDetail = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePrepareForShipping = async () => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/prepare-shipping`);
      Alert.alert(
        'Thành công',
        'Đơn hàng đã sẵn sàng để giao',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Chuẩn bị giao hàng thất bại');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THÔNG TIN ĐƠN HÀNG</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã đơn:</Text>
          <Text style={styles.infoValue}>#{order.order_code}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Người gửi:</Text>
          <Text style={styles.infoValue}>{order.sender_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Người nhận:</Text>
          <Text style={styles.infoValue}>{order.receiver_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa chỉ:</Text>
          <Text style={styles.infoValue}>{order.receiver_address}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THÔNG TIN HÀNG HÓA</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Khối lượng:</Text>
          <Text style={styles.infoValue}>{order.weight} kg</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kích thước:</Text>
          <Text style={styles.infoValue}>
            {order.length}x{order.width}x{order.height} cm
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giá trị:</Text>
          <Text style={styles.infoValue}>
            {order.item_value ? `${order.item_value.toLocaleString()} VND` : 'Không có'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phí vận chuyển:</Text>
          <Text style={styles.infoValue}>{order.shipping_fee.toLocaleString()} VND</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dịch vụ:</Text>
          <Text style={styles.infoValue}>
            {order.service_type === 'express' ? 'Hỏa tốc' : 'Tiết kiệm'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.prepareButton}
        onPress={handlePrepareForShipping}
      >
        <Text style={styles.prepareButtonText}>CHUẨN BỊ GIAO HÀNG</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  section: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#2c3e50'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  infoLabel: {
    width: 120,
    color: '#7f8c8d'
  },
  infoValue: {
    flex: 1
  },
  prepareButton: {
    backgroundColor: '#e67e22',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  prepareButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default WarehouseOrderDetail;