import { Box, Typography } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { BrowserView, MobileView } from 'react-device-detect';
import { Outlet } from 'react-router-dom';

import leaf_icon from '../assets/leaf-green.svg';

export default function Admin() {
    return (
        <SnackbarProvider>
            <MobileView>
                <Box justifyContent="center" textAlign="center" margin="0.75rem">
                    <Typography variant="h4" gutterBottom>
                        Admin Panel
                    </Typography>
                    <img src={leaf_icon} alt="" />
                    <Typography variant="h5" sx={{ mt: 2 }}>
                        You&apos;re on mobile! Please go to desktop to view admin panel.
                    </Typography>
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
