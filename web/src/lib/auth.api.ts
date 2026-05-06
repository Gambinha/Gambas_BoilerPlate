import type { AuthUser } from '@/types/auth'
import { api } from '@/lib/api'

export type LoginPayload = { email: string; password: string }
export type LoginResponse = { accessToken: string }
export type RegisterPayload = { email: string; password: string; name: string }

export const authApi = {
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    api.post('/auth/login', payload),

  register: (payload: RegisterPayload): Promise<LoginResponse> =>
    api.post('/auth/register', payload),

  getProfile: (): Promise<AuthUser> => api.get('/auth/profile/me'),
}
