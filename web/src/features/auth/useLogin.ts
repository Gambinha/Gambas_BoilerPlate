import { useAuth } from '@/contexts/AuthContext'
import { authApi, type LoginPayload } from '@/lib/auth.api'
import { authStore } from '@/store/auth.store'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

export function useLogin() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async ({ accessToken }) => {
      authStore.setToken(accessToken)
      const profile = await authApi.getProfile()
      setUser(profile)
      navigate('/')
    },
  })
}
