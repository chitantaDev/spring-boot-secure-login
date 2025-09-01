import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { authService } from "../services/authServices";
import { getCSRFToken } from "../helper/csrfUtils";
import CssBaseline from "@mui/joy/CssBaseline";
import { useState } from 'react';

export const HomePage = () => {
    const { user, logout: logoutStore, accessToken } = useAuthStore()
    const navigate = useNavigate()
    const [apiResponse, setApiResponse] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const handleLogout = async () => {
        await authService.logout()
        logoutStore()
        navigate('/login')
    }

    // Test GET request (CSRF token required)
    const testGetRequest = async () => {
        setLoading(true)
        try {
            const csrfToken = getCSRFToken()
            const response = await fetch('http://localhost:8080/api/v1/demo-controller', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-XSRF-TOKEN': csrfToken || ''
                }
            })
            const data = await response.text()
            setApiResponse(`GET Success: ${data}`)
        } catch (error) {
            setApiResponse(`GET Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    // Test POST request (CSRF token required)
    const testPostRequest = async () => {
        setLoading(true)
        try {
            const csrfToken = getCSRFToken()
            const response = await fetch('http://localhost:8080/api/v1/management', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken || ''
                }
            })
            const data = await response.text()
            setApiResponse(`POST Success: ${data}`)
        } catch (error) {
            setApiResponse(`POST Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    // Test POST request WITHOUT CSRF token (should fail)
    const testPostWithoutCSRF = async () => {
        setLoading(true)
        try {
            const response = await fetch('http://localhost:8080/api/v1/management', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                    // No X-XSRF-TOKEN header
                }
            })
            const data = await response.text()
            setApiResponse(`POST Without CSRF: ${data}`)
        } catch (error) {
            setApiResponse(`POST Without CSRF Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome, {user?.firstname}!</h1>
            <p>Role: {user?.role}</p>
            
            <div style={{ margin: '20px 0' }}>
                <h3>API Test Buttons:</h3>
                <button 
                    onClick={testGetRequest} 
                    disabled={loading}
                    style={{ margin: '5px', padding: '10px' }}
                >
                    Test GET Request (with CSRF)
                </button>
                <button 
                    onClick={testPostRequest} 
                    disabled={loading}
                    style={{ margin: '5px', padding: '10px' }}
                >
                    Test POST with CSRF
                </button>
                <button 
                    onClick={testPostWithoutCSRF} 
                    disabled={loading}
                    style={{ margin: '5px', padding: '10px' }}
                >
                    Test POST without CSRF (should fail)
                </button>
            </div>

            {apiResponse && (
                <div style={{ 
                    margin: '20px 0', 
                    padding: '10px', 
                    backgroundColor: '#f5f5f5', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    color: "black"
                }}>
                    <strong>API Response:</strong><br/>
                    {apiResponse}
                </div>
            )}

            <div style={{ margin: '20px 0' }}>
                <button onClick={() => navigate('/test')}>Go to Test Page</button>
                <button onClick={() => navigate('/content')}>Go to Content Page</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

