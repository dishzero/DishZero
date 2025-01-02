import leaf_icon from '../assets/leaf-green.svg'
import { MobileView, BrowserView } from 'react-device-detect'
import '../styles/admin.css'
import { Box, ThemeProvider, createTheme } from '@mui/material'
import AdminDishesPage from '../admin/DishesPage/dishesPage'
import { SnackbarProvider } from 'notistack'
import Email from '../admin/EmailPage/email'
import AdminUserPage from '../admin/UserPage/userPage'
import AdminHomePage from '../admin/AdminHome/adminHomePage'
import AdminSidebar, { SIDEBAR_WIDTH } from '../admin/AdminSidebar/adminSidebar'

export default function Admin({ path }: { path?: string }) {
    const theme = createTheme({
        palette: {
            primary: {
                dark: '#006049', // DISHZERO_COLOR_DARK
                main: '#48b697', // DISHZERO_COLOR
                light: '#a7ffe9', // DISHZERO_COLOR_LIGHT
            },
            secondary: {
                dark: '#964A65', // SECONDARY_DARK,
                main: '#B56983', // SECONDARY
                light: '#C5899E', // SECONDARY_LIGHT
            },
        },
    })

    return (
        <ThemeProvider theme={theme}>
            <SnackbarProvider>
                {/* on mobile */}
                <MobileView>
                    <Box justifyContent="center" textAlign="center" margin="0.75rem">
                        <h1>Admin Panel</h1>
                        <img src={leaf_icon} alt="" />
                        <h2>You're on mobile! Please go to desktop to view admin panel.</h2>
                    </Box>
                </MobileView>

                {/* on desktop */}
                <BrowserView>
                    <Box
                        display="flex"
                        flexDirection={'column'}
                        sx={{ border: '2px solid blue', height: 'fit-content' }}>
                        <AdminSidebar />
                        <Box display={'flex'} sx={{ marginLeft: SIDEBAR_WIDTH }}>
                            {path == 'dishes' && <AdminDishesPage />}
                            {path == 'users' && <AdminUserPage />}
                            {path == 'email' && <Email />}
                            {(path == '' || !path) && <AdminHomePage />}
                        </Box>
                    </Box>
                </BrowserView>
            </SnackbarProvider>
        </ThemeProvider>
    )
}
