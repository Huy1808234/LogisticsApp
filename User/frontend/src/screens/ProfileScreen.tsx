import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../utils/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  CreateOrder: undefined;
  OrderDetail: { code: string };
};

type User = {
  id: number;
  email: string;
  username: string;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export default function ProfileScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("Token:", token);

      if (!token) {
        return navigation.replace("Login");
      }

      const res = await API.get("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("User:", res.data);
      setUser(res.data);
    } catch (err: any) {
      console.error("Lỗi lấy thông tin người dùng:", err.response?.data || err.message);
      Alert.alert("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại");
      await AsyncStorage.removeItem("accessToken");
      navigation.replace("Login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

 const logout: () => Promise<void> = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
  navigation.replace("Login");
};

  const handleViewLatestOrder = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        return Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
      }

      const res = await axios.get("http://192.168.1.28:3001/api/orders/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const latestOrder = res.data[0]; // Lấy đơn đầu tiên (mới nhất)
      if (!latestOrder?.Order_code) {
        return Alert.alert("Không tìm thấy đơn hàng");
      }

      navigation.navigate("OrderDetail", { code: latestOrder.Order_code });
    } catch (err: any) {
      console.error("Lỗi khi lấy đơn hàng:", err);
      Alert.alert("Lỗi", "Không thể lấy thông tin đơn hàng");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Xin chào, <Text style={{ fontWeight: "bold" }}>{user?.username}</Text>!
      </Text>

      <Button
        title="Tạo đơn hàng"
        onPress={() => navigation.navigate("CreateOrder")}
      />
      <View style={{ height: 20 }} />

      <Button
        title="Xem đơn hàng gần nhất"
        onPress={handleViewLatestOrder}
      />
      <View style={{ height: 20 }} />

      <Button title="Đăng xuất" color="red" onPress={logout} />
    </View>
  );
}
