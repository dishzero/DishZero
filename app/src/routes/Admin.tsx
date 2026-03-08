import { Box, Button, Typography } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { BrowserView, isMobile, MobileView } from 'react-device-detect';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';

import leaf_icon from '../assets/leaf-green.svg';

export default function Admin() {
    const { pathname } = useLocation();

    if (isMobile && pathname !== '/admin') {
        return <Navigate to="/admin" replace />;
    }

    return (
        <SnackbarProvider>
            <MobileView>
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        px: 2,
                    }}>
                    <img src={leaf_icon} alt="" />
                    <Typography variant="h5">
                        You&apos;re on mobile! Please go to desktop to view admin panel.
                    </Typography>
                    <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
                        Back to home
                    </Button>
                </Box>
            </MobileView>

            <BrowserView>
                <Box
                    component="main"
                    bgcolor="background.default"
                    sx={{
                        flex: 1,
                        minHeight: '100vh',
                    }}>
                    <Outlet />
                </Box>
            </BrowserView>
        </SnackbarProvider>
    );
}
