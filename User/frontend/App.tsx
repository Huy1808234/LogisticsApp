import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CreateOrderScreen from "./src/screens/CreateOrderScreen";
import OrderDetailScreen from "./src/screens/OrderDetailScreen";
import OrderThankYouScreen from "./src/screens/OrderThankYouScreen";
import OrderStatusScreen from "./src/screens/OrderStatusScreen";
import { RootStackParamList } from "./src/navigation/types";
import FeedbackScreen from "./src/screens/FeedbackScreen";
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={ProfileScreen} />
        <Stack.Screen name="CreateOrder" component={CreateOrderScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="OrderThankYou" component={OrderThankYouScreen} />
        <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
        <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
