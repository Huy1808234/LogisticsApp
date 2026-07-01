import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

const ActivePickupScreen = ({ route }) => {
  const { StaffID } = route.params;
  const navigation = useNavigation();
  const [activePickup, setActivePickup] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActivePickup = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/driver-active-pickup`, {
        params: { driverId: StaffID }
      });
      setActivePickup(response.data || null);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng đang lấy:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchActivePickup();
    }, [])
  );

  useEffect(() => {
    if (!loading && activePickup) {
      navigation.navigate('PickupDetailScreen', {
        order: {
          OrderID: activePickup.OrderID,
          Order_code: activePickup.Order_code,
          Sender_name: activePickup.Sender_name,
          Sender_phone: activePickup.Sender_phone,
          Sender_address: activePickup.Sender_address,
          Service_name: activePickup.Service_name
        },
        StaffID
      });
    }
  }, [activePickup, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📦 ĐƠN HÀNG ĐANG LẤY</Text>

      {!activePickup ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có đơn hàng nào đang lấy</Text>
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
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50'
  },
  emptyContainer: {
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
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default ActivePickupScreen;