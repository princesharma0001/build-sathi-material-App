
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  roles: UserRole[];
  activeRole: UserRole;
}

export interface LoginPayload {
  phone: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
}

export interface OTPPayload {
  phone: string;
  otp: string;
}

export type UserRole =
  | 'buyer'
  | 'seller'
  | 'contractor'
  | 'admin';