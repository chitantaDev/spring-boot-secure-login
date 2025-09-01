import React, {useEffect, useState} from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {useAuthStore} from './store/authStore'
import {HomePage} from './pages/HomePage'
import {PrivateRoute} from './components/PrivateRoute'
import {authService} from "./services/authServices";
import {TestPage} from "./pages/TestPage";
import {NotFoundPage} from "./pages/NotFoundPage";
import PrivateRoutes from "./components/PrivateRoutes";
import ContentPageExample from "./pages/content/ContentPageExample";
import {createTheme, ThemeProvider} from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import {VanillaLoginPage} from "./pages/VanillaLoginPage";
import NavigationBar from "./components/NavigationBar";

//TODO: handle loading states properly, it looks like shit // another TODO @ContentPageExample.tsx
const App = () => {
    const setAuth = useAuthStore(state => state.setAuth)
    const [isLoading, setIsLoading] = useState(true)
    const privateRoutes = [
        {path: "home", element: <HomePage/>},
        {path: "test", element: <TestPage/>},
        {path: "/content", element: <ContentPageExample/>},
        {path: "*", element: <NotFoundPage/>},
    ]

    const darkTheme = createTheme({
        palette: {
            mode: "dark",
        },
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authResponse = await authService.checkAuth()
                if (authResponse) {
                    // Extract user data and accessToken from the response
                    const { accessToken: newAccessToken, ...userData } = authResponse
                    setAuth(userData, newAccessToken)
                }
                // If no auth response, just let PrivateRoute handle the redirect
            } catch (error) {
                console.error('Auth check failed:', error)
                // Let PrivateRoute handle the redirect
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [setAuth])

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <BrowserRouter>
                {/*<NavigationBar/>*/}
                <Routes>
                    <Route path="/login" element={<VanillaLoginPage/>} />
                    <Route element={<PrivateRoute/>}>
                        <Route
                            path={"*"}
                            element={<PrivateRoutes routes={privateRoutes}/>}
                        />
                    </Route>
                    <Route path="/" element={<HomePage/>} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App