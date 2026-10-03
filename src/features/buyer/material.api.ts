import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '../auth/auth.store';
import { API_BASE_URL } from '../../config/api';

export interface MaterialCategory {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  unit: string;
  imageUrl?: string | null;
  isActive: boolean;
  category: MaterialCategory;
}

export const getMaterialsApi = async (): Promise<Material[]> => {
    const token = await getToken();
  const response = await axios.get(`${API_BASE_URL}/materials`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data?.data?.materials || [];
};