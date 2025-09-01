/**
 * CSRF Token Utilities
 * Handles CSRF token management for secure API requests
 */

/**
 * Get CSRF token from browser cookies
 * @returns CSRF token string or null if not found
 */
export const getCSRFToken = (): string | null => {
    const cookies = document.cookie.split(';');
    const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    return xsrfCookie ? decodeURIComponent(xsrfCookie.split('=')[1]) : null;
};

/**
 * Check if CSRF token exists in cookies
 * @returns true if CSRF token is present
 */
export const hasCSRFToken = (): boolean => {
    return getCSRFToken() !== null;
};

/**
 * Create headers object with CSRF token for state-changing requests
 * @param method HTTP method
 * @param additionalHeaders Additional headers to include
 * @returns Headers object with CSRF token if needed
 */
export const createCSRFHeaders = (method: string, additionalHeaders: Record<string, string> = {}): Record<string, string> => {
    const headers = { ...additionalHeaders };
    
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
        }
    }
    
    return headers;
};

/**
 * Log CSRF token status for debugging
 */
export const logCSRFStatus = (): void => {
    const token = getCSRFToken();
    console.log('CSRF Token Status:', {
        hasToken: token !== null,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 10)}...` : 'None'
    });
};
