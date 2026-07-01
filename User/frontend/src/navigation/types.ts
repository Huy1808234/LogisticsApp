export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateOrder: undefined;
  OrderDetail: { code: string };
  OrderThankYou: { orderId: string };
  FeedbackScreen: { orderId: string; staffId: number; shipperName: string };
  OrderStatus: { code: string };

};
