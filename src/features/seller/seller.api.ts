import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '../auth/auth.store';
import { API_BASE_URL } from '../../config/api';
import { DispatchMaterialPayload } from '../../navigation/types';


export interface SellerBasicProfilePayload {
  ownerName: string;
  businessName: string;
  businessType: string;
  gstRegistered: boolean;
  gstNumber?: string;
  panNumber?: string;
  phone: string;
  email?: string;
}

export interface UpdateSellerProfilePayload {
    ownerName: string;
    businessName: string;
    businessType: string;
    gstRegistered: boolean;
    gstNumber?: string;
    panNumber?: string;
    phone: string;
    email?: string;
  }

export interface SellerProfile {
    id: string;
    userId: string;
    ownerName: string;
    businessName: string;
    businessType: string;
    gstRegistered: boolean;
    gstNumber: string | null;
    panNumber: string | null;
    phone: string;
    email: string | null;
    createdAt: string;
    updatedAt: string;
  }

export const createSellerBasicProfileApi = async (
  payload: SellerBasicProfilePayload,
) => {
  const token = await getToken();

  if (!token) {
    throw new Error(
      'Authentication token not found',
    );
  }

  const response = await axios.post(
    `${API_BASE_URL}/sellers/profile/basic`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.data?.success) {
    throw new Error(
      response.data?.message ||
        'Unable to save seller profile',
    );
  }

  return response.data;
};

export const getSellerProfileApi = async (): Promise<SellerProfile> => {
    const token = await getToken();
  
    if (!token) {
      throw new Error('Authentication token not found');
    }
  
    const response = await axios.get(
      `${API_BASE_URL}/sellers/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Unable to fetch seller profile',
      );
    }
  
    return response.data.data.profile;
  };

  export const updateSellerProfileApi = async (
    payload: UpdateSellerProfilePayload,
  ): Promise<SellerProfile> => {
    const token = await AsyncStorage.getItem('@buildsathi_token');
  
    if (!token) {
      throw new Error('Authentication token not found');
    }
  
    const response = await axios.put(
      `${API_BASE_URL}/sellers/profile`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Unable to update seller profile',
      );
    }
  
    return response.data.data.profile;
  };

  export const getSellerRequirementsApi = async () => {
    const token = await AsyncStorage.getItem('@buildsathi_token');
  
    if (!token) {
      throw new Error('Authentication token not found');
    }
  
    const response = await axios.get(
      `${API_BASE_URL}/sellers/requirements`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  
    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'Unable to fetch requirements',
      );
    }
  
    return response.data.data.requirements;
  };

  export const getSellerRequirementByIdApi = async (
    requirementId: string,
  ) => {
    const token = await AsyncStorage.getItem(
      '@buildsathi_token',
    );
  
    const response = await axios.get(
      `${API_BASE_URL}/sellers/requirements/${requirementId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    return response.data?.data?.requirement;
  };


  export const getSellerDashboardApi = async () => {
    const token = await AsyncStorage.getItem(
      '@buildsathi_token',
    );  
    const response = await fetch(
      `${API_BASE_URL}/sellers/dashboard`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
  
    const rawText = await response.text();
  
    console.log('DASHBOARD STATUS:', response.status);
    console.log('DASHBOARD URL:', response.url);
    console.log('DASHBOARD RAW RESPONSE:', rawText);
  
    if (!response.ok) {
      throw new Error(
        `Dashboard API failed: ${response.status} ${rawText}`,
      );
    }
  
    try {
      return JSON.parse(rawText);
    } catch (error) {
      throw new Error(
        `Server returned non-JSON response: ${rawText.substring(0, 300)}`,
      );
    }
  };

  export const dispatchMaterial = async (
    payload: DispatchMaterialPayload,
  ) => {
    const token = await AsyncStorage.getItem("@buildsathi_token");
  
    if (!token) {
      throw new Error("Authentication token not found");
    }
  
    const response = await fetch(
      `${API_BASE_URL}/sellers/orders/dispatch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
  
    const result = await response.json();
  
    if (!response.ok || !result.success) {
      throw new Error(
        result?.message || "Failed to dispatch material",
      );
    }
  
    return result;
  };

export const getSellerOrders = async () => {
  const token = await AsyncStorage.getItem("@buildsathi_token");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch(
    `${API_BASE_URL}/sellers/orders`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result?.message || "Failed to fetch seller orders",
    );
  }

  return result;
};