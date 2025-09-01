import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const TestPage = () => {
    const navigate = useNavigate()
    const user = useAuthStore(state => state.user)

    return (
        <div>
            <h1>Test Page</h1>
            <p>Still authenticated as: {user?.firstname}</p>
            <button onClick={() => navigate('/home')}>Back to Home</button>
        </div>
    );
};