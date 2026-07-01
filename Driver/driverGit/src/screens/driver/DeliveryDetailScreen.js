import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PanResponder,
  Animated,
  Dimensions,
  ScrollView,
  Linking,
  Modal
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import API_URL from '../../config/apiconfig';

const { height } = Dimensions.get('window');
const MIN_HEIGHT = height * 0.4;
const MAX_HEIGHT = height * 0.8;

const DeliveryDetailScreen = ({ route }) => {
  const { order, StaffID } = route.params;
  const navigation = useNavigation();
  const [showFailureReasons, setShowFailureReasons] = useState(false);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 10.8231,
    longitude: 106.6297,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  const panY = useRef(new Animated.Value(MIN_HEIGHT)).current;

  // Xử lý quyền camera
  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const { status } = await requestPermission();
        setHasCameraPermission(status === 'granted');

        if (status !== 'granted') {
          Alert.alert(
            'Yêu cầu quyền truy cập',
            'Vui lòng cấp quyền camera trong cài đặt',
            [
              { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
              { text: 'Hủy', style: 'cancel' }
            ]
          );
        }
      } else {
        setHasCameraPermission(true);
      }
    })();
  }, [permission]);

  // Xử lý quyền vị trí
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập vị trí để sử dụng');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        return gestureState.y0 < (height - MIN_HEIGHT + 40);
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = MIN_HEIGHT - gestureState.dy;
        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          panY.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          Animated.spring(panY, {
            toValue: MIN_HEIGHT,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy < -50) {
          Animated.spring(panY, {
            toValue: MAX_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      setIsCameraVisible(false);
      showConfirmationDialog(photo.uri);
    } catch (error) {
      console.error('Lỗi chụp ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const showConfirmationDialog = (imageUri) => {
    Alert.alert(
      'Xác nhận ảnh',
      'Bạn có chắc chắn muốn dùng ảnh này để xác nhận?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => { }
        },
        {
          text: 'Xác nhận',
          onPress: () => confirmDelivery(imageUri)
        }
      ]
    );
  };

  const confirmDelivery = async (imageUri) => {
    try {
      const fileName = `delivery_${Date.now()}.jpg`;
      const newPath = FileSystem.cacheDirectory + fileName;

      await FileSystem.moveAsync({
        from: imageUri,
        to: newPath
      });

      await axios.put(`${API_URL}/orders/${order.OrderID}/status`, {
        newStatus: 'Hoàn thành',
        proof_image: newPath,
        staffId: StaffID
      });

      Alert.alert('Thành công', 'Đã xác nhận giao hàng thành công!');
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi xác nhận:', error);
      Alert.alert('Lỗi', 'Không thể xác nhận đơn hàng');
    }
  };

  const handleDeliverySuccess = () => {
    if (!hasCameraPermission) {
      Alert.alert('Vui lòng cấp quyền camera để chụp ảnh xác nhận');
      return;
    }
    setIsCameraVisible(true);
  };

  const failureReasons = [
    "Không gặp khách",
    "Khách từ chối nhận",
    "Địa chỉ không chính xác"
  ];

  const handleDeliveryFailure = () => {
    setShowFailureReasons(true);
  };

  const updateStatus = async (status, notes) => {
    try {
      await axios.put(`${API_URL}/orders/${order.OrderID}/status`, {
        newStatus: status,
        notes: notes,
        staffId: StaffID
      });

      if (status === 'Thất bại') {
        navigation.navigate('DriverDashboardScreen', {
          StaffID: StaffID,
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Cập nhật trạng thái thất bại');
    }
  };

return (
  <View style={styles.container}>
    {isCameraVisible && (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleTakePicture}
        >
          <Text style={styles.captureText}>📸</Text>
        </TouchableOpacity>
      </View>
    )}

    <Animated.View
      style={[styles.mapContainer, { height: Animated.subtract(height, panY) }]}
    >
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            }}
            title="Vị trí của bạn"
          />
        )}
      </MapView>
      <TouchableOpacity
        style={[styles.homeButton, styles.homeButtonContainer]}
        onPress={() => navigation.navigate('DriverDashboardScreen', { StaffID })}
      >
        <Text style={styles.homeButtonText}>🏠 Về trang chủ</Text>
      </TouchableOpacity>
    </Animated.View>

    <Animated.View
      style={[styles.infoPanel, { height: panY }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.dragHandle} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.header}>
          ĐANG GIAO: Đơn hàng #{order.Order_code || order.order_code}
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>👤 Người nhận: {order.receiver_name}</Text>
          <Text style={styles.infoText}>📍 Địa chỉ: {order.receiver_address}</Text>
          <Text style={styles.infoText}>📞 Điện thoại: {order.receiver_phone}</Text>
          <Text style={styles.infoText}>⚖️ Cân nặng: {order.Weight} kg</Text>
          <Text style={styles.infoText}>📦 Dịch vụ: {order.Service_name}</Text>
          <Text style={styles.infoText}>
            💰 Tổng tiền: {parseFloat(order.Ship_cost).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={handleDeliverySuccess}
            disabled={isCameraVisible}
          >
            <Text style={styles.buttonText}>✔️ GIAO HÀNG THÀNH CÔNG</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.failureButton]}
            onPress={handleDeliveryFailure}
            disabled={isCameraVisible}
          >
            <Text style={styles.buttonText}>✖️ GIAO HÀNG THẤT BẠI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>

    <Modal
      visible={showFailureReasons}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFailureReasons(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn lý do thất bại</Text>
          
          {failureReasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reasonButton}
              onPress={() => {
                updateStatus('Thất bại', reason);
                setShowFailureReasons(false);
              }}
            >
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowFailureReasons(false)}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mapContainer: { width: '100%' },
  map: StyleSheet.absoluteFillObject,
  header: { fontSize: 18, fontWeight: 'bold', margin: 15, color: '#2c3e50', textAlign: 'center' },
  infoContainer: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFD54F'
  },
  infoText: { fontSize: 16, marginBottom: 10, color: '#555' },
  buttonGroup: { margin: 15 },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15
  },
  successButton: { backgroundColor: '#FFD54F' },
  failureButton: { backgroundColor: '#FFD54F' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  homeButtonContainer: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 1,
  },
  homeButton: {
    backgroundColor: '#FFD54F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: {
    fontSize: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  reasonButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  reasonText: {
    fontSize: 16
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    alignItems: 'center'
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default DeliveryDetailScreen;