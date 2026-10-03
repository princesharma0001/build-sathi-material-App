import {API_BASE_URL} from '../../config/api';
import {getToken} from '../auth/auth.store';

const parseResponse = async (response: Response) => {
  const raw = await response.text();

  let result: any;

  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error(
      `Invalid server response. Status: ${response.status}`,
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result?.message || 'Something went wrong. Please try again.',
    );
  }

  return result;
};

/**
 * PUBLIC
 * GET /subscriptions/plans
 */
export const getSubscriptionPlans = async () => {
  const response = await fetch(
    `${API_BASE_URL}/subscriptions/plans`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

  return parseResponse(response);
};

/**
 * SELLER
 * POST /subscriptions/purchase
 */
export const purchaseSubscription = async (planId: string) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(
    `${API_BASE_URL}/subscriptions/purchase`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        planId,
      }),
    },
  );

  return parseResponse(response);
};

/**
 * SELLER
 * POST /subscriptions/orders/:orderId/verify
 */
export const verifySubscriptionPayment = async (
  orderId: string,
) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(
    `${API_BASE_URL}/subscriptions/orders/${orderId}/verify`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return parseResponse(response);
};

/**
 * SELLER
 * GET /subscriptions/me
 */
export const getMySubscription = async () => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(
    `${API_BASE_URL}/subscriptions/me`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return parseResponse(response);
};

/**
 * SELLER
 * GET /subscriptions/orders
 */
export const getSubscriptionOrders = async () => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(
    `${API_BASE_URL}/subscriptions/orders`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return parseResponse(response);
};