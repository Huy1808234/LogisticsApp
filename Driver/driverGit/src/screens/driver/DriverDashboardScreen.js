import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_URL from '../../config/apiconfig';

export default function DriverDashboardScreen({ route }) {
  const navigation = useNavigation();
  const { StaffID } = route.params;
  const [staffInfo, setStaffInfo] = useState(null);

  useEffect(() => {
    const fetchStaffInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/staff/${StaffID}`);
        setStaffInfo(response.data);
      } catch (err) {
        console.error('Lỗi lấy thông tin nhân viên:', err);
      }
    };

    fetchStaffInfo();
  }, []);

  const handlePickupPress = () => {
    navigation.navigate('PickupOrdersScreen', { StaffID });
  };

  const handleDeliveryPress = () => {
    navigation.navigate('DeliveryOrdersScreen', { StaffID });
  };

  const handleActiveOrdersPress = () => {
    navigation.navigate('ActiveOrderScreen', { StaffID });
  };

  const handleActivePickupPress = () => {
    navigation.navigate('ActivePickupScreen', { StaffID });
  };

  const handleOrderHistoryPress = () => {
    navigation.navigate('OrderHistoryScreen', { StaffID });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../../assets/img/avatars/5.png')}
            style={styles.avatar}
          />
          <View style={styles.nameSection}>
            <Text style={styles.staffName}>
              {staffInfo?.Name || 'Tên nhân viên'}
            </Text>
            <Text style={styles.staffPosition}>
              {staffInfo?.Position || 'Chức vụ'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {/* Hàng 1: 3 ô */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={handlePickupPress}>
            <View style={styles.iconCircle}>
              <Image source={require('../../../assets/img/icons/driver1.png')} style={styles.iconImage} />
            </View>
            <Text style={styles.menuText}>Lấy hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleDeliveryPress}>
            <View style={styles.iconCircle}>
              <Image source={require('../../../assets/img/icons/driver3.png')} style={styles.iconImage} />
            </View>
            <Text style={styles.menuText}>Giao hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleActiveOrdersPress}>
            <View style={styles.iconCircle}>
              <Image source={require('../../../assets/img/icons/driver2.png')} style={styles.iconImage} />
            </View>
            <Text style={styles.menuText}>Đang giao</Text>
          </TouchableOpacity>
        </View>

        {/* Hàng 2: 2 ô */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItemWide} onPress={handleActivePickupPress}>
            <View style={styles.iconCircle}>
              <Image source={require('../../../assets/img/icons/driver2.png')} style={styles.iconImage} />
            </View>
            <Text style={styles.menuText}>Đang lấy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemWide} onPress={handleOrderHistoryPress}>
            <View style={styles.iconCircle}>
              <Image source={require('../../../assets/img/icons/driver4.png')} style={styles.iconImage} />
            </View>
            <Text style={styles.menuText}>Lịch sử giao</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#FFD54F',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  nameSection: {
    flex: 1,
    marginLeft: 10,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  staffPosition: {
    fontSize: 13,
    color: '#fff',
  },
  logoutButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  logoutText: {
    fontSize: 14,
    color: '#FFD54F',
    fontWeight: 'bold',
  },
  menuItem: {
    alignItems: 'center',
    width: '33%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFD54F',
  },
  iconImage: {
    width: 30,
    height: 30,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  menuItemWide: {
    alignItems: 'center',
    width: '40%',
  },
});
