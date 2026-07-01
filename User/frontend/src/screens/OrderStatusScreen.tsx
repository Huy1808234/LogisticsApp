  import React, { useEffect, useState } from 'react';
  import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
  import axios from 'axios';
  import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
  import { NativeStackNavigationProp } from '@react-navigation/native-stack';
  import { RootStackParamList } from '../navigation/types';

  type OrderStatusScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

  type OrderStatus = {
    Order_code: string;
    Order_status: string;
    Payment_status: string;
    TrackingStatus: string | null;
    Staff_id: number | null;
    ShipperName: string | null;
  };

  const OrderStatusScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<OrderStatusScreenRouteProp>();
    const { code } = route.params;

    const [status, setStatus] = useState<OrderStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      axios
        .get(`http://192.168.1.28:3001/api/orders/${code}/status`)
         .then((res) => {
      console.log("API trả về:", res.data); // <-- Thêm dòng này để kiểm tra
      setStatus(res.data);
    })
        .catch(() => Alert.alert('Lỗi', 'Không thể lấy trạng thái đơn hàng'))
        .finally(() => setLoading(false));
    }, [code]);

    const handleFeedback = () => {
      if (status?.Staff_id && status?.Order_code) {
        navigation.navigate('FeedbackScreen', {
          orderId: status.Order_code,
          staffId: status.Staff_id,
          shipperName: status.ShipperName ?? '',
        });
      }
    };

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    if (!status) return <Text style={{ padding: 20 }}>Không có dữ liệu đơn hàng.</Text>;

    return (
      <View style={{ padding: 20 }}>
        <Text>Mã đơn hàng: {status.Order_code}</Text>
        <Text>Trạng thái đơn: {status.Order_status}</Text>
        <Text>Trạng thái thanh toán: {status.Payment_status}</Text>
        {status.TrackingStatus === 'Đã giao' && (
          <View style={{ marginTop: 20 }}>
            <Text>Shipper: {status.ShipperName}</Text>
            <Button title="Đánh giá shipper" onPress={handleFeedback} />
          </View>
        )}
      </View>
    );
  };

  export default OrderStatusScreen;
