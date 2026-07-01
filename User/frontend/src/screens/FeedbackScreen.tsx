import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RouteProp,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type FeedbackScreenRouteProp = RouteProp<RootStackParamList, 'FeedbackScreen'>;
type FeedbackScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function FeedbackScreen() {
  const route = useRoute<FeedbackScreenRouteProp>();
  const navigation = useNavigation<FeedbackScreenNavProp>();

  const { orderId, staffId, shipperName } = route.params;

  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const submitFeedback = async () => {
    const numRating = parseInt(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      Alert.alert('Lỗi', 'Vui lòng nhập điểm từ 1 đến 5');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token, vui lòng đăng nhập lại.');
        return;
      }

      console.log('Đang gửi đánh giá:', {
        orderId,
        staffId,
        rating: numRating,
        comment,
      });

      const response = await axios.post(
        'http://192.168.1.28:3001/api/feedback',
        {
          orderId,
          staffId,
          rating: numRating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Server phản hồi:', response.data);
      Alert.alert('Thành công', 'Đã gửi đánh giá!');
      navigation.goBack();
    } catch (err: any) {
      console.error('Lỗi gửi feedback:', err?.response?.data || err.message);
      Alert.alert('Lỗi', 'Không gửi được đánh giá');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Đánh giá shipper</Text>
      <Text style={styles.label}>Người giao: {shipperName}</Text>

      <Text style={styles.label}>Nhập điểm (1–5):</Text>
      <TextInput
        keyboardType="numeric"
        value={rating}
        onChangeText={setRating}
        placeholder="Ví dụ: 5"
        style={styles.input}
      />

      <Text style={styles.label}>Nhận xét:</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Nhập nhận xét..."
        multiline
        style={[styles.input, styles.textArea]}
      />

      <Button title="Gửi đánh giá" onPress={submitFeedback} color="#27ae60" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
