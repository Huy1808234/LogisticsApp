import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';

export default function OrderDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { code } = route.params as { code: string };

  const [order, setOrder] = useState<any>(null);
  const [hasPaid, setHasPaid] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token, vui lòng đăng nhập lại.');
        return;
      }

      const res = await axios.get(
        `http://192.168.1.28:3001/api/orders/${code}/detail`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrder(res.data);
    } catch (err) {
      console.error('Lỗi lấy chi tiết đơn hàng:', err);
    }
  }, [code]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      if (order?.Payment_status !== 'Đã thanh toán') {
        fetchOrder();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchOrder, order?.Payment_status]);

  useEffect(() => {
    if (order?.Payment_status === 'Đã thanh toán') {
      setHasPaid(true);
      const timer = setTimeout(() => setHasPaid(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setHasPaid(false);
    }
  }, [order?.Payment_status]);

  const handleMomoPayment = async () => {
    try {
      const response = await axios.post(
        'http://192.168.1.28:3001/api/momo/create',
        {
          orderId: order.Order_code,
          amount: Number(order.Ship_cost),
        }
      );

if (response.data?.payUrl) {
  Linking.openURL(response.data.payUrl); // ✅ dùng cái này để test bình thường
} else {
  Alert.alert("Không mở được thanh toán MoMo");
}

    } catch (err: any) {
      Alert.alert(
        'Lỗi thanh toán MoMo',
        JSON.stringify(err?.response?.data || err.message)
      );
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn huỷ đơn hàng này?', [
      {
        text: 'Huỷ',
        style: 'cancel',
      },
      {
        text: 'Xác nhận',
        onPress: async () => {
          try {
            await axios.put(
              `http://192.168.1.28:3001/api/orders/cancel/${order.Order_code}`
            );
            Alert.alert('Huỷ đơn hàng thành công');
            fetchOrder();
          } catch (err: any) {
            Alert.alert(
              'Lỗi huỷ đơn hàng',
              JSON.stringify(err?.response?.data || err.message)
            );
          }
        },
      },
    ]);
  };

  const handleViewStatus = () => {
    navigation.navigate('OrderStatus', { code: order.Order_code });
  };

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đơn hàng hoặc bạn chưa đăng nhập.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {hasPaid && (
        <Text style={styles.success}>Đơn hàng đã thanh toán thành công!</Text>
      )}
      {order.Payment_status === 'Thất bại' && (
        <Text style={styles.fail}>
          Thanh toán thất bại hoặc đơn hàng đã bị huỷ.
        </Text>
      )}

      <Text style={styles.heading}>Chi tiết đơn hàng: {order.Order_code}</Text>

      <View style={styles.block}>
        <Text style={styles.title}>Người gửi</Text>
        <Text>{order.senderName} ({order.senderPhone})</Text>
        <Text>{order.senderAddress}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.title}>Người nhận</Text>
        <Text>{order.receiverName} ({order.receiverPhone})</Text>
        <Text>{order.receiverAddress}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.title}>Thông tin kiện hàng</Text>
        <Text>Mô tả: {order.Description}</Text>
        <Text>Khối lượng: {order.Total_weight} kg</Text>
        <Text>Kích thước: {order.Dimensions}</Text>
        <Text>Giá trị: {parseInt(order.Value).toLocaleString()} VND</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.title}>Trạng thái</Text>
        <Text>Đơn hàng: {order.Order_status}</Text>
        <Text>
          Thanh toán:{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color:
                order.Payment_status === 'Đã thanh toán' ? 'green' : 'orange',
            }}
          >
            {order.Payment_status || 'Chưa cập nhật'}
          </Text>
        </Text>
        <Text>Phí ship: {parseInt(order.Ship_cost).toLocaleString()} VND</Text>
        <Text>Ngày tạo: {new Date(order.Created_at).toLocaleDateString()}</Text>
      </View>

      {order.Payment_status !== 'Đã thanh toán' &&
        order.Payment_status !== 'Thất bại' && (
          <View style={styles.buttonGroup}>
            <Button title="Thanh toán MoMo" onPress={handleMomoPayment} />
            <View style={{ height: 10 }} />
            <Button
              title="Huỷ đơn hàng"
              color="#c0392b"
              onPress={handleCancelOrder}
            />
          </View>
        )}

      <View style={{ marginTop: 20 }}>
        <Button title="Xem trạng thái đơn hàng" onPress={handleViewStatus} />
      </View>
      {order.Payment_status === 'Đã thanh toán' && (
  <View style={{ marginTop: 20 }}>
    <Button
      title="Đánh giá người giao"
      color="#27ae60"
      onPress={() =>
        navigation.navigate('FeedbackScreen', {
          orderId: order.Order_code,
          staffId: order.Staff_id,
          shipperName: order.Shipper_name,
        })
      }
    />
  </View>
)}



    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  block: {
    marginVertical: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fail: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonGroup: {
    marginTop: 20,
  },
});
