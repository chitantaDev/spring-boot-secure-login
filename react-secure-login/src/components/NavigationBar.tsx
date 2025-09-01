import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import {useAuthStore} from "../store/authStore";
import {useNavigate} from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';

//TODO: Make AppName clickable to redirect to /home, without influencing the entire Navbar UI lol
// (AppName Element spans across the entire width... isolate it, or look in mui docs if i did it wrong
export default function NavigationBar() {
    const {isAuthenticated} = useAuthStore();
    const navigate = useNavigate()
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={() => navigate("/home")}
                    >
                        <HomeIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        AppName
                    </Typography>
                    {isAuthenticated && (
                        <Button color="inherit">
                            Logout
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
