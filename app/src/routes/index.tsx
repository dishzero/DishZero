import { Box } from '@mui/material';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import AdminHomePage from '../admin/AdminHome/AdminHomePage';
import AdminDishesPage from '../admin/DishesPage/AdminDishesPage';
import Email from '../admin/EmailPage/Email';
import AdminUserPage from '../admin/UserPage/AdminUserPage';
import Sidebar from '../components/Sidebar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Admin from './Admin';
import BorrowRoute from './Borrow';
import Error404 from './Error404';
import HomeRoute from './Home';
import LoginRoute from './Login';
import ReturnRoute from './Return';

const enum Role {
    admin = 'admin',
    volunteer = 'volunteer',
    customer = 'customer',
}

interface PermissionProps {
    validator: (role: string | undefined) => boolean;
}

const AuthLayout = () => {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
};

const UserRoute = () => {
    const { currentUser } = useAuth();

    if (currentUser) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <Box component="main" sx={{ flex: 1, minHeight: '100vh' }}>
                    <Outlet />
                </Box>
            </Box>
        );
    }

    return <LoginRoute />;
};

const PermissionsRoute = (props: PermissionProps) => {
    const { currentUser } = useAuth();
    if (props.validator(currentUser?.role)) {
        return <Outlet />;
    }
    return <Error404 />;
};

// TODO: all routes should be defined here (e.g. everything in admin) and all route's code should have a mirrored structure
const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        errorElement: <Error404 />,
        children: [
            {
                path: '/',
                element: <UserRoute />,
                errorElement: <Error404 />,
                children: [
                    {
                        index: true,
                        element: <HomeRoute />,
                    },
                    {
                        path: '/home',
                        element: <HomeRoute />,
                    },
                    {
                        path: '/borrow',
                        element: <BorrowRoute />,
                        loader: async ({ request }) => {
                            const url = new URL(request.url);
                            const qid = url.searchParams.get('q');
                            if (!qid) {
                                return null;
                            }

                            try {
                                // const tid = await DishAPI.addDishBorrow(qid, null);
                                const tid = 1;
                                return { qid: qid, tid: tid };
                            } catch (e) {
                                console.log('Unable to immediately borrow:', e);
                                return { qid: qid, error: e };
                            }
                        },
                    },
                    {
                        path: '/volunteer',
                        element: <PermissionsRoute validator={(r) => r === Role.volunteer || r === Role.admin} />,
                        children: [
                            {
                                // TODO: wrap in "VOLUNTEER" route
                                path: '/volunteer/return',
                                element: <ReturnRoute noTimer={undefined} />,
                            },
                        ],
                    },
                    {
                        path: '/admin',
                        element: <PermissionsRoute validator={(r) => r === Role.admin} />,
                        errorElement: <Error404 />,
                        children: [
                            {
                                element: <Admin />,
                                children: [
                                    { index: true, element: <AdminHomePage /> },
                                    { path: 'dishes', element: <AdminDishesPage /> },
                                    { path: 'users', element: <AdminUserPage /> },
                                    { path: 'email', element: <Email /> },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                path: '/login',
                element: <LoginRoute />,
            },
            {
                path: '/login/:transaction_id',
                element: <LoginRoute />,
            },
        ],
    },
]);

function App() {
    return <RouterProvider router={router} fallbackElement={<Error404 />} />;
}

export default App;
