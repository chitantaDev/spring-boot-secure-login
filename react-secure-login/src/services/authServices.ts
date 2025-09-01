import axios from 'axios'
import {BASE_URL} from "../helper/Constants";

/**
 * Spring sets refresh token cookies, access token is returned in response body
 */
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

type User = {
    email: string
    firstname: string
    lastname: string
    role: string
}

type AuthResponse = {
    email: string
    firstname: string
    lastname: string
    role: string
    accessToken: string
}

export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post('/auth/authenticate', {
            email,
            password
        })
        return response.data
    },

    async checkAuth(): Promise<AuthResponse | null> {
        try {
            console.log("checkingAuth with /auth/me")
            const response = await api.get('/auth/me')
            
            // Check if there's a new access token in the response header
            const newAccessToken = response.headers['x-new-access-token']
            if (newAccessToken) {
                // Update the response data with the new access token
                return {
                    ...response.data,
                    accessToken: newAccessToken
                }
            }
            
            return response.data
        } catch {
            return null
        }
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout')
    },

    // Helper function to create authenticated API instance
    createAuthenticatedApi: (accessToken: string) => {
        return axios.create({
            baseURL: BASE_URL,
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
    }
}