import { Box, Typography } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { BrowserView, MobileView } from 'react-device-detect';

import AdminHomePage from '../admin/AdminHome/AdminHomePage';
import AdminSidebar, { SIDEBAR_WIDTH } from '../admin/AdminSidebar/AdminSidebar';
import AdminDishesPage from '../admin/DishesPage/AdminDishesPage';
import Email from '../admin/EmailPage/Email';
import AdminUserPage from '../admin/UserPage/AdminUserPage';
import leaf_icon from '../assets/leaf-green.svg';
import theme from '../theme';

export default function Admin({ path }: { path?: string }) {
    return (
        <SnackbarProvider>
            {/* on mobile */}
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

            {/* on desktop */}
            <BrowserView>
                <Box display="flex" flexDirection={'column'} sx={{ height: 'fit-content' }}>
                    <AdminSidebar />
                    <Box
                        display={'flex'}
                        sx={{
                            marginLeft: SIDEBAR_WIDTH,
                            backgroundColor: theme.palette.background.default,
                            minHeight: '100vh',
                        }}>
                        {path == 'dishes' && <AdminDishesPage />}
                        {path == 'users' && <AdminUserPage />}
                        {path == 'email' && <Email />}
                        {(path == '' || !path) && <AdminHomePage />}
                    </Box>
                </Box>
            </BrowserView>
        </SnackbarProvider>
    );
}
