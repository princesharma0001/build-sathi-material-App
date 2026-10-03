export type RootStackParamList = {
  Auth: undefined;
  Buyer: undefined;
  Seller: undefined;
};

export type AuthStackParamList = {
  Login: undefined;

  Register: undefined;

  OTP: {
    email: string;
  };

  SelectRole: {
    email: string;
  };

  BuyerProfileBasic: undefined;

  SellerProfileBasic: undefined;
};

export interface DispatchMaterialPayload {
  quoteId: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  expectedDeliveryDate?: string;
  deliveryNotes?: string;
}

export type BuyerStackParamList = {
  BuyerProfile: undefined;
  Location: undefined;
  BuyerHome: undefined;
  CreateRequirement: undefined;
  MyRequirements: undefined;
  Quotes: { requirementId?: string };
  SellerDetails: { sellerId?: string };
  OrderDetails: { orderId?: string };
};

export type SellerStackParamList = {
  SellerDashboard: undefined;
  Requirements: undefined;
  RequirementDetails: {
    requirementId: string;
  };
  SubmitQuote: {
    requirementId: string;
  };
  MyQuotes: undefined;
  Orders: undefined;
  OrderDetails: {
    orderId: string;
  };
  Subscription: undefined;
  Profile: undefined;
};
