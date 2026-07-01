import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAccessToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("accessToken");
};
