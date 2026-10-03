import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../config/api";
import { getToken } from "../auth/auth.store";

export interface CreateRequirementPayload {
  materialId: string;
  deliveryAddressId: string;
  quantity: number;
  unit: string;
  deliveryPreference: string;
  notes?: string;
}

export interface Requirement {
  id: string;
  buyerId: string;
  materialId: string;
  deliveryAddressId: string;
  quantity: number | string;
  unit: string;
  deliveryPreference: string;
  notes?: string | null;
  status: 'OPEN' | 'QUOTED' | 'ACCEPTED' | 'ORDERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;

  material: {
    id: string;
    name: string;
    description?: string | null;
    unit: string;
    imageUrl?: string | null;
    category?: {
      id: string;
      name: string;
    } | null;
  };

  deliveryAddress: {
    id: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
}

export const createRequirementApi = async (
  payload: CreateRequirementPayload
) => {
//   const token = await getToken();
  const token = await AsyncStorage.getItem('@buildsathi_token');
  console.log("token hai",token);
  

  console.log("dfsdf", token);

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await axios.post(`${API_BASE_URL}/requirements`, payload, {
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
  });

  return response.data;
};

export const getBuyerRequirementsApi = async (): Promise<Requirement[]> => {
  const token = await AsyncStorage.getItem('@buildsathi_token');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await axios.get(
    `${API_BASE_URL}/requirements`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || 'Unable to fetch requirements',
    );
  }

  return response.data?.data?.requirements || [];
};

export const getRequirementByIdApi = async (
  requirementId: string,
): Promise<Requirement> => {
  const token = await AsyncStorage.getItem('@buildsathi_token');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await axios.get(
    `${API_BASE_URL}/requirements/${requirementId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || 'Unable to fetch requirement',
    );
  }

  return response.data.data.requirement;
};

