import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import leaf_icon from '../assets/leaf-green.svg';
import { useAuth } from '../contexts/AuthContext';

export default function Error404() {
    const { currentUser } = useAuth();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                px: 4,
                color: 'text.primary',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }}>
            <img src={leaf_icon} alt="" />
            <Typography variant="h2" sx={{ my: 3 }}>
                404
            </Typography>
            <Typography variant="h5" sx={{ my: 2 }}>
                Page not found!
            </Typography>

            {currentUser ? (
                // logged in
                <>
                    <Typography variant="body2" sx={{ maxWidth: 244 }}>
                        We're sorry. The page you requested could not be found. Please go back to the homepage.
                    </Typography>
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 4, px: 6 }}>
                        Home
                    </Button>
                </>
            ) : (
                // not logged in
                <>
                    <Typography variant="body2" sx={{ maxWidth: 244 }}>
                        We're sorry. The page you requested could not be found. Please login.
                    </Typography>
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 4, px: 6 }}>
                        Login
                    </Button>
                </>
            )}
        </Box>
    );
}
