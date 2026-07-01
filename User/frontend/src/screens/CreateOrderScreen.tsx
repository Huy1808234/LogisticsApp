import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function CreateOrderScreen() {
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverCity: "",
    receiverDistrict: "",
    receiverWard: "",
    receiverStreet: "",
    description: "",
    weight: "",
    height: "",
    width: "",
    length: "",
    paymentMethod: "",
    extraServices: [] as string[],
  });

  const [declaredValue, setDeclaredValue] = useState("");
  const [photoData, setPhotoData] = useState("");

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleService = (service: string) => {
    const current = new Set(formData.extraServices);
    current.has(service) ? current.delete(service) : current.add(service);
    setFormData({ ...formData, extraServices: Array.from(current) });
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64 = result.assets[0].base64;
      if (base64) {
        setPhotoData(`data:image/jpeg;base64,${base64}`);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return Alert.alert("Lỗi", "Vui lòng đăng nhập lại");

      const payload = {
        ...formData,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        width: parseFloat(formData.width),
        length: parseFloat(formData.length),
        declaredValue: declaredValue ? parseInt(declaredValue) : 0,
        photo: photoData,
      };

      console.log("Payload gửi lên:", payload);

      const res = await axios.post(
        "http://192.168.1.28:3001/api/orders",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orderCode = res.data.orderCode;
      if (!orderCode) return Alert.alert("Lỗi", "Không nhận được mã đơn hàng");

      if (formData.paymentMethod === "MoMo") {
        Alert.alert("Chuyển tới thanh toán MoMo");
        // TODO: navigate to payment screen
      } else {
        Alert.alert("Đã tạo đơn hàng thành công");
      }
    } catch (err: any) {
      console.log("Order error:", err.response?.data || err.message);
      Alert.alert(
        "Lỗi",
        err.response?.data?.error || "Không gửi được đơn hàng"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tạo Đơn Hàng</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ tên người nhận"
        value={formData.receiverName}
        onChangeText={(v) => handleChange("receiverName", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="SĐT người nhận"
        value={formData.receiverPhone}
        onChangeText={(v) => handleChange("receiverPhone", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Tỉnh/Thành phố"
        value={formData.receiverCity}
        onChangeText={(v) => handleChange("receiverCity", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Quận/Huyện"
        value={formData.receiverDistrict}
        onChangeText={(v) => handleChange("receiverDistrict", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phường/Xã"
        value={formData.receiverWard}
        onChangeText={(v) => handleChange("receiverWard", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Số nhà, tên đường"
        value={formData.receiverStreet}
        onChangeText={(v) => handleChange("receiverStreet", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Loại hàng hóa"
        value={formData.description}
        onChangeText={(v) => handleChange("description", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Khối lượng (kg)"
        keyboardType="numeric"
        value={formData.weight}
        onChangeText={(v) => handleChange("weight", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Chiều cao (cm)"
        keyboardType="numeric"
        value={formData.height}
        onChangeText={(v) => handleChange("height", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Chiều rộng (cm)"
        keyboardType="numeric"
        value={formData.width}
        onChangeText={(v) => handleChange("width", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Chiều dài (cm)"
        keyboardType="numeric"
        value={formData.length}
        onChangeText={(v) => handleChange("length", v)}
      />

      <Text style={styles.label}>Dịch vụ thêm:</Text>
      {["Freight", "Express Delivery", "Insurance", "Packaging"].map((s) => (
        <TouchableOpacity
          key={s}
          onPress={() => toggleService(s)}
          style={styles.checkbox}
        >
          <Text>
            {formData.extraServices.includes(s) ? "✅" : "⬜"} {s}
          </Text>
        </TouchableOpacity>
      ))}

      {formData.extraServices.includes("Insurance") && (
        <TextInput
          style={styles.input}
          placeholder="Giá trị đơn hàng (VNĐ)"
          keyboardType="numeric"
          value={declaredValue}
          onChangeText={setDeclaredValue}
        />
      )}

      <Text style={styles.label}>Phương thức thanh toán:</Text>
      {["MoMo", "ATM", "VISA", "COD"].map((method) => (
        <TouchableOpacity
          key={method}
          onPress={() => handleChange("paymentMethod", method)}
          style={styles.checkbox}
        >
          <Text>
            {formData.paymentMethod === method ? "🔘" : "⚪"} {method}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.cameraBtn} onPress={openCamera}>
        <Text style={styles.btnText}>📷 Chụp ảnh đơn hàng</Text>
      </TouchableOpacity>

      {photoData && (
        <Image
          source={{ uri: photoData }}
          style={{ width: "100%", height: 200, marginVertical: 10 }}
          resizeMode="contain"
        />
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.btnText}>Tạo đơn hàng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  label: { fontWeight: "bold", marginVertical: 10 },
  checkbox: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginBottom: 8,
  },
  cameraBtn: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  submitBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 30,
  },
  btnText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
});
