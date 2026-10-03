import axios from 'axios';
import {API_BASE_URL} from '../../config/api';

export interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'CONTRACTOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: LoginUser;
    token: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export type ApiUserRole =
  | 'BUYER'
  | 'SELLER'
  | 'CONTRACTOR'
  | 'ADMIN';

export interface SelectRoleResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: ApiUserRole;
      status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    };
    token: string;
  };
}


export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    verified: boolean;
    email: string;
  };
}


export const loginApi = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Login failed');
  }

  return data;
};

export const registerApi = async (
  payload: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Registration failed');
  }

  return data;
};

export const verifyOtpApi = async (
  email: string,
  otp: string,
): Promise<VerifyOtpResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || 'OTP verification failed',
    );
  }

  return data;
};

export const selectRoleApi = async (
  email: string,
  role: 'BUYER' | 'SELLER',
): Promise<SelectRoleResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/select-role`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || 'Unable to select role',
    );
  }

  return data;
};

export const forgotPasswordApi = async (
  email: string,
) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/auth/forgot-password`,
    {
      email,
    },
  );

  return response.data;
};

export const verifyForgotPasswordOtpApi =
  async (
    email: string,
    otp: string,
  ) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/verify-forgot-password-otp`,
      {
        email,
        otp,
      },
    );

    return response.data;
  };

  export const resetPasswordApi = async (
    email: string,
    otp: string,
    newPassword: string,
  ) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/reset-password`,
      {
        email,
        otp,
        newPassword,
      },
    );
  
    return response.data;
  };

  export const resendOtpApi = async (
    email: string,
  ) => {
    if (!email?.trim()) {
      throw new Error('Email is required');
    }
  
    const response = await axios.post(
      `${API_BASE_URL}/auth/resend-otp`,
      {
        email: email.trim().toLowerCase(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  
    return response.data;
  };