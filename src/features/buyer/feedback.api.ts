
import axios from 'axios';
import { getToken } from '../auth/auth.store';
import { API_BASE_URL } from '../../config/api';


export interface CreateFeedbackPayload {
  orderId: string;
  rating: number;
  comment?: string;
}

export const createFeedbackApi = async (
  payload: CreateFeedbackPayload,
) => {
  const token = await getToken();

  if (!token) {
    throw new Error('SESSION_EXPIRED');
  }

  const response = await axios.post(
    `${API_BASE_URL}/feedback`,
    payload,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    },
  );

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || 'Failed to submit feedback',
    );
  }

  return response.data;
};

export const getOrderFeedbackStatusApi = async (
  orderId: string,
) => {
  const token = await getToken();

  if (!token) {
    throw new Error('SESSION_EXPIRED');
  }

  const response = await axios.get(
    `${API_BASE_URL}/feedback/order/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000,
    },
  );

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || 'Failed to fetch feedback status',
    );
  }

  return response.data.data;
};
