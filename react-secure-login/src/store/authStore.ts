import { create } from 'zustand'

type User = {
    email: string
    firstname: string
    lastname: string
    role: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
    setAuth: (user: User, accessToken: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    setAuth: (user, accessToken) => set(() => ({
        user,
        accessToken,
        isAuthenticated: !!user
    })),
    logout: () => set(() => ({
        user: null,
        accessToken: null,
        isAuthenticated: false
    }))
}))