import {API_BASE_URL} from '../../config/api';
import {getToken} from '../auth/auth.store';

export interface BuyerProfilePayload {
  name: string;
  phoneNumber?: string;
  companyName?: string;
  state: string;
  city: string;
  pincode: string;
  completeAddress: string;
}

export interface BuyerProfileData {
  id: string | null;
  name: string;
  phoneNumber: string | null;
  email: string;
  companyName: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
  completeAddress: string | null;
}

export interface BuyerProfileResponse {
  success: boolean;
  message: string;
  data: BuyerProfileData;
}

// GET PROFILE
export const getBuyerProfileApi = async (): Promise<BuyerProfileResponse> => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication session expired. Please login again.');
  }

  const response = await fetch(
    `${API_BASE_URL}/buyer/profile`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || 'Unable to fetch buyer profile.',
    );
  }

  return data;
};

// CREATE PROFILE
export const createBuyerProfileApi = async (
  payload: BuyerProfilePayload,
): Promise<BuyerProfileResponse> => {
  return saveBuyerProfileApi('POST', payload);
};

// EDIT / UPDATE PROFILE
export const updateBuyerProfileApi = async (
  payload: BuyerProfilePayload,
): Promise<BuyerProfileResponse> => {
  return saveBuyerProfileApi('PATCH', payload);
};

// COMMON POST/PATCH FUNCTION
const saveBuyerProfileApi = async (
  method: 'POST' | 'PATCH',
  payload: BuyerProfilePayload,
): Promise<BuyerProfileResponse> => {
  const token = await getToken();

  if (!token) {
    throw new Error(
      'Authentication session expired. Please login again.',
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/buyer/profile`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Unable to ${method === 'PATCH' ? 'update' : 'create'} buyer profile.`,
    );
  }

  return data;
};

export const getBuyerOrders = async () => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const url = `${API_BASE_URL}/buyer/orders`;

  console.log('BUYER ORDERS URL:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const rawResponse = await response.text();

  console.log('BUYER ORDERS STATUS:', response.status);
  console.log('BUYER ORDERS RESPONSE:', rawResponse);

  let result;

  try {
    result = JSON.parse(rawResponse);
  } catch {
    throw new Error(
      `Server returned non-JSON response. Status: ${response.status}`,
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result?.message || 'Failed to fetch buyer orders',
    );
  }

  return result;
};

export const confirmMaterialReceived = async (
  orderId: string,
) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(
    `${API_BASE_URL}/buyer/orders/${orderId}/received`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json();

  console.log(
    'CONFIRM MATERIAL RECEIVED:',
    result,
  );

  if (!response.ok || !result.success) {
    throw new Error(
      result?.message ||
        'Failed to confirm material received',
    );
  }

  return result;
};