import axios from "axios";
import { API_BASE_URL } from "../config/api";


export type ContentPage = {
  id: string;
  type: "TERMS" | "PRIVACY" | "ABOUT";
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  version: number;
  publishedAt?: string | null;
};

export const getPublishedContent = async (): Promise<ContentPage[]> => {
  const response = await axios.get(`${API_BASE_URL}/content`);
  return response.data?.data ?? [];
};

export const getContentBySlug = async (
  slug: string,
): Promise<ContentPage> => {
  const response = await axios.get(
    `${API_BASE_URL}/content/${slug}`,
  );

  return response.data?.data;
};