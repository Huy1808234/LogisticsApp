import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type OrderThankYouRouteProp = RouteProp<RootStackParamList, 'OrderThankYou'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OrderThankYouScreen() {
  const route = useRoute<OrderThankYouRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { orderId: rawOrderId } = route.params;
  const orderId = rawOrderId?.split(',')[0].trim() || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      if (!orderId) {
        setDebugInfo('orderId is missing or malformed.');
        return setStatus('failed');
      }

      try {
        console.log('Đang kiểm tra đơn hàng:', orderId);
        const res = await axios.get(`http://192.168.1.28:3001/api/orders/detail/${orderId}`);
        const paymentStatus = res.data?.Payment_status?.trim();

        if (paymentStatus === 'Đã thanh toán') {
          setStatus('success');
          setDebugInfo('Payment_status = Đã thanh toán');
          setTimeout(() => {
            navigation.navigate('OrderDetail', { code: orderId });
          }, 2000);
        } else {
          setStatus('failed');
          setDebugInfo(`Payment_status = ${paymentStatus}`);
        }
      } catch (err) {
        console.error('Lỗi lấy trạng thái đơn hàng:', err);
        setDebugInfo('Lỗi gọi API hoặc đơn hàng không tồn tại.');
        setStatus('failed');
      }
    };

    fetchStatus();
  }, [orderId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết quả thanh toán</Text>
      <Text style={styles.text}>
        Mã đơn hàng: <Text style={{ fontWeight: 'bold' }}>{orderId || 'Không có'}</Text>
      </Text>

      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color="#555" />
          <Text style={styles.text}>Đang kiểm tra trạng thái đơn hàng...</Text>
        </>
      )}

      {status === 'success' && (
        <>
          <Text style={styles.success}>Thanh toán thành công!</Text>
          <Text>Đang chuyển đến trang chi tiết đơn hàng...</Text>
        </>
      )}

      {status === 'failed' && (
        <>
          <Text style={styles.fail}>Giao dịch thất bại!</Text>
          <Text>Vui lòng kiểm tra lại hoặc thử thanh toán lại sau.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
  success: {
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fail: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
