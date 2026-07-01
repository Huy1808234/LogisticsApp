import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const WarehouseProcessingScreen = ({ route, navigation }) => {
  const { order, WarehouseID } = route.params;

  const [form, setForm] = useState({
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    itemValue: '',
  });

  const [shippingFee, setShippingFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);
  const [regionType, setRegionType] = useState('');

  const calculateShippingFee = async () => {
    if (!form.weight || !order.Sender_address || !order.Receiver_address) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/shipping/calculate`, {
        from: order.Sender_address,
        to: order.Receiver_address,
        weight: form.weight,
        itemValue: form.itemValue,
        serviceName: order.Service_name
      });

      const { total, distance, regionType } = response.data;
      setShippingFee(total);
      setDistance(distance);
      setRegionType(regionType);
    } catch (error) {
      console.error('Lỗi tính phí:', error);
      setShippingFee(30000);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    const { length, width, height } = form.dimensions;
    if (!form.weight || !length || !width || !height) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin bắt buộc');
      return;
    }

    try {
      await axios.post(`${API_URL}/orders/${order.OrderID}/package`, {
        weight: parseFloat(form.weight),
        dimensions: {
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height)
        },
        current_warehouse_id: WarehouseID,
        ship_cost: shippingFee,
        item_value: parseFloat(form.itemValue || 0)
      });

      Alert.alert('Thành công', 'Đơn hàng đã được xử lý', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Lỗi khi xử lý đơn:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THÔNG TIN ĐƠN HÀNG</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoLine}>Mã đơn: {order.Order_code}</Text>
          <Text style={styles.infoLine}>Địa chỉ gửi: {order.Sender_address}</Text>
          <Text style={styles.infoLine}>Địa chỉ nhận: {order.Receiver_address}</Text>
          <Text style={styles.infoLine}>Dịch vụ: {order.Service_name}</Text>
          {distance && <Text style={styles.infoLine}>Khoảng cách: {distance} km</Text>}
          {regionType && <Text style={styles.infoLine}>Khu vực: {regionType.replace('_', ' ')}</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THÔNG TIN HÀNG HÓA</Text>

        <TextInput
          style={styles.input}
          placeholder="Cân nặng (kg)*"
          keyboardType="numeric"
          value={form.weight}
          onChangeText={(text) => setForm({ ...form, weight: text })}
        />

        <View style={styles.dimensionsRow}>
          {['length', 'width', 'height'].map((dim) => (
            <TextInput
              key={dim}
              style={[styles.input, styles.dimensionInput]}
              placeholder={`${dim === 'length' ? 'Dài' : dim === 'width' ? 'Rộng' : 'Cao'} (cm)*`}
              keyboardType="numeric"
              value={form.dimensions[dim]}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  dimensions: { ...form.dimensions, [dim]: text }
                })
              }
            />
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Giá trị hàng (VND)"
          keyboardType="numeric"
          value={form.itemValue}
          onChangeText={(text) => setForm({ ...form, itemValue: text })}
        />
      </View>

      <TouchableOpacity
        style={[styles.calculateButton, loading && styles.disabledButton]}
        onPress={calculateShippingFee}
        disabled={loading}
      >
        <Text style={styles.completeButtonText}>BẮT ĐẦU TÍNH PHÍ</Text>
      </TouchableOpacity>

      <View style={styles.feeContainer}>
        <Text style={styles.feeLabel}>Phí vận chuyển:</Text>
        {loading ? (
          <Text style={styles.loadingText}>Đang tính...</Text>
        ) : (
          <Text style={styles.feeValue}>{shippingFee.toLocaleString()} VND</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.completeButton, loading && styles.disabledButton]}
        onPress={handleComplete}
        disabled={loading}
      >
        <Text style={styles.completeButtonText}>HOÀN THÀNH XỬ LÝ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50'
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db'
  },
  infoLine: {
    fontSize: 14,
    marginBottom: 6,
    color: '#34495e'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  dimensionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dimensionInput: {
    width: '30%'
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e8f4fc',
    borderRadius: 8,
    marginVertical: 10
  },
  feeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50'
  },
  feeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c'
  },
  loadingText: {
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  completeButton: {
    backgroundColor: '#FFD54F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  disabledButton: {
    backgroundColor: '#95a5a6'
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  calculateButton: {
    backgroundColor: '#03A9F4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  }
});

export default WarehouseProcessingScreen;
