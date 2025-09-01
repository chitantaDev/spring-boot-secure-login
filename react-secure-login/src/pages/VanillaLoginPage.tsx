import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {authService} from "../services/authServices";

/**
 * keeping this for now, will need later when im making a template
 * @constructor
 */
export const VanillaLoginPage = () => {
    const navigate = useNavigate()
    const setAuth = useAuthStore(state => state.setAuth)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const authResponse = await authService.login(email, password)
            // Extract user data and accessToken from the response
            const { accessToken, ...userData } = authResponse
            setAuth(userData, accessToken)
            navigate('/home')
        } catch (err) {
            setError('Login failed')
            console.error(err)
        }
    }

    return (
        <div>
            <h1>Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    )
}