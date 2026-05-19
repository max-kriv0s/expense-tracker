import { apiClient } from '@/shared/api/client';
import type { Category } from '@/entities/category/model/types';

export const categoriesApi = {
  getAll: (token: string) =>
    apiClient.get<Category[]>('/categories', token),

  create: (token: string, name: string) =>
    apiClient.post<Category>('/categories', { name }, token),
};
