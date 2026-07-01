import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import API_URL from '../../config/apiconfig';

const avatars = [
  require('../../../assets/img/avatars/1.png'),
  require('../../../assets/img/avatars/2.png'),
  require('../../../assets/img/avatars/3.png'),
  require('../../../assets/img/avatars/4.png'),
  require('../../../assets/img/avatars/5.png'),
  require('../../../assets/img/avatars/6.png'),
  require('../../../assets/img/avatars/7.png'),
];

const DriverAssignmentScreen = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const getAvatar = (StaffID) => {
    const index = StaffID % avatars.length;
    return avatars[index];
  };

  const fetchAssignedCount = async (StaffID) => {
    try {
      const response = await axios.get(`${API_URL}/drivers/${StaffID}/assigned-count`);
      return response.data.count || 0;
    } catch (error) {
      console.error(`Lỗi khi lấy số đơn của nhân viên ${StaffID}:`, error);
      return 0;
    }
  };

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/drivers`);
      const enrichedStaffs = await Promise.all(
        response.data.map(async (staff) => {
          const count = await fetchAssignedCount(staff.StaffID);
          return {
            ...staff,
            avatar: getAvatar(staff.StaffID),
            assignedCount: count
          };
        })
      );
      setStaffs(enrichedStaffs);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleStaffPress = (StaffID) => {
    navigation.navigate('DriverAssignedOrders', { StaffID });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>NHÂN VIÊN</Text>
        <Text style={styles.headerLabel}>SỐ ĐƠN</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.driverCard}
      onPress={() => handleStaffPress(item.StaffID)}
    >
      <View style={styles.driverInfo}>
        <Image
          source={item.avatar}
          style={styles.avatar}
          defaultSource={require('../../../assets/img/avatars/1.png')}
        />
        <View>
          <Text style={styles.driverName}>{item.Name}</Text>
          <Text style={styles.driverPhone}>{item.Phone}</Text>
        </View>
      </View>
      <View style={styles.orderCountContainer}>
        <Text style={styles.orderCountText}>{item.assignedCount} đơn</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStaffs();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={staffs}
        renderItem={renderItem}
        keyExtractor={item => item.StaffID.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có nhân viên nào</Text>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5'
  },
  headerContainer: {
    backgroundColor: '#FFD54F',
    marginBottom: 5
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15
  },
  headerLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  driverCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15
  },
  driverName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50'
  },
  driverPhone: {
    color: '#7f8c8d',
    marginTop: 3
  },
  orderCountContainer: {
    backgroundColor: '#E53935',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  orderCountText: {
    color: 'white',
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d'
  },
  listContainer: {
    paddingBottom: 20
  }
});

export default DriverAssignmentScreen;
