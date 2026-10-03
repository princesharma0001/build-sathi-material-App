import { API_BASE_URL } from '../../config/api';
import { getToken } from '../auth/auth.store';

export interface DeliveryAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryAddressPayload {
  label?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

/* =========================================================
   GET ALL ADDRESSES
========================================================= */

export const getDeliveryAddressesApi =
  async (): Promise<DeliveryAddress[]> => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        'Authentication session expired. Please login again.',
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/addresses`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          'Unable to fetch delivery addresses',
      );
    }

    return data?.data?.addresses || [];
  };

/* =========================================================
   GET SINGLE ADDRESS
========================================================= */

export const getDeliveryAddressApi =
  async (
    addressId: string,
  ): Promise<DeliveryAddress> => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        'Authentication session expired. Please login again.',
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/addresses/${addressId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          'Unable to fetch delivery address',
      );
    }

    return data?.data?.address;
  };

/* =========================================================
   CREATE ADDRESS
========================================================= */

export const createDeliveryAddressApi =
  async (
    payload: DeliveryAddressPayload,
  ): Promise<DeliveryAddress> => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        'Authentication session expired. Please login again.',
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/addresses`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          'Unable to save delivery address',
      );
    }

    return data?.data?.address;
  };

/* =========================================================
   UPDATE ADDRESS
========================================================= */

export const updateDeliveryAddressApi =
  async (
    addressId: string,
    payload: DeliveryAddressPayload,
  ): Promise<DeliveryAddress> => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        'Authentication session expired. Please login again.',
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/addresses/${addressId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          'Unable to update delivery address',
      );
    }

    return data?.data?.address;
  };

/* =========================================================
   DELETE ADDRESS
========================================================= */

export const deleteDeliveryAddressApi =
  async (
    addressId: string,
  ): Promise<void> => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        'Authentication session expired. Please login again.',
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/addresses/${addressId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          'Unable to delete delivery address',
      );
    }
  };

/* =========================================================
   SET DEFAULT ADDRESS
========================================================= */

export const setDefaultDeliveryAddressApi =
  async (
    addressId: string,
  ): Promise<void> => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        'Authentication session expired. Please login again.',
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/addresses/${addressId}/default`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          'Unable to set default address',
      );
    }
  };