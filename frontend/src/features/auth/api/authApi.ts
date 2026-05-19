import { apiClient } from '@/shared/api/client';
import type { User, AuthTokens } from '@/entities/user/model/types';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { email: string; name: string; password: string };

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>('/users/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<User>('/users/register', payload),

  me: (token: string) =>
    apiClient.get<User>('/users/me', token),
};
