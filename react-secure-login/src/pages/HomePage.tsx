import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { authService } from "../services/authServices";
import CssBaseline from "@mui/joy/CssBaseline";

export const HomePage = () => {
    const { user, logout: logoutStore } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await authService.logout()
        logoutStore()
        navigate('/login')
    }

    return (
        <div>
            <h1>Welcome, {user?.firstname}!</h1>
            <p>Role: {user?.role}</p>
            <button onClick={() => navigate('/test')}>Go to Test Page</button>
            <button onClick={() => navigate('/content')}>Go to Content Page</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

