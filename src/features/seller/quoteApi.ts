import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/api';

export interface CreateQuotePayload {
  requirementId: string;
  pricePerUnit: number;
  deliveryCharges: number;
  deliveryTime: string;
  validity: string;
  message: string;
}

export const createQuoteApi = async (
  payload: CreateQuotePayload,
) => {
  const token = await AsyncStorage.getItem('@buildsathi_token');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await axios.post(
    `${API_BASE_URL}/quotes`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

export const getSellerQuotesApi = async () => {
    const token = await AsyncStorage.getItem('@buildsathi_token');
  
    if (!token) {
      throw new Error('Authentication token not found');
    }
  
    const response = await axios.get(
      `${API_BASE_URL}/quotes/seller`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    return response.data;
  };

  export const getSellerQuoteByIdApi = async (
    quoteId: string,
  ) => {
    const token = await AsyncStorage.getItem(
      '@buildsathi_token',
    );
  
    if (!token) {
      throw new Error('Authentication token not found');
    }
  
    const response = await axios.get(
      `${API_BASE_URL}/quotes/${quoteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    return response.data;
  };

  export const getBuyerQuotesApi = async () => {
    const token = await AsyncStorage.getItem(
      '@buildsathi_token',
    );
  
    if (!token) {
      throw new Error(
        'Authentication token not found',
      );
    }
  
    const response = await axios.get(
      `${API_BASE_URL}/quotes/buyer`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    return response.data;
  };

  export const getBuyerQuoteByIdApi = async (
    quoteId: string,
  ) => {
    const token = await AsyncStorage.getItem(
      '@buildsathi_token',
    );
  
    if (!token) {
      throw new Error('Authentication token not found');
    }
  
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }
  
    const response = await axios.get(
      `${API_BASE_URL}/quotes/buyer/${quoteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    return response.data;
  };

  export const acceptBuyerQuoteApi = async (
    quoteId: string,
  ) => {
    const token = await AsyncStorage.getItem(
      '@buildsathi_token',
    );
  
    if (!token) {
      throw new Error(
        'Authentication token not found',
      );
    }
  
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }
  
    const response = await axios.patch(
      `${API_BASE_URL}/quotes/buyer/${quoteId}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  
    return response.data;
  };