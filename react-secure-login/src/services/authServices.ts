import axios from 'axios'
import {BASE_URL} from "../helper/Constants";
import {getCSRFToken} from "../helper/csrfUtils";

/**
 * Spring sets refresh token cookies, access token is returned in response body
 * CSRF tokens are set in XSRF-TOKEN cookie and must be sent in X-XSRF-TOKEN header
 */

// CSRF token handling is now imported from csrfUtils

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

// Add request interceptor to include CSRF token in headers for ALL requests
api.interceptors.request.use((config) => {
    // Skip CSRF for auth endpoints
    const url = config.url || '';
    if (url.includes('/auth/authenticate') || url.includes('/auth/register') || url.includes('/auth/logout')) {
        return config;
    }
    
    // Add CSRF token to ALL other requests
    const csrfToken = getCSRFToken();
    if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    return config;
});

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


}