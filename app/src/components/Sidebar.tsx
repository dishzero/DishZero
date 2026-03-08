import {
    AssignmentTurnedIn,
    Bento,
    Close as CloseIcon,
    Email as EmailIcon,
    Home,
    Logout,
    Menu as MenuIcon,
    Person2,
    PsychologyAlt,
    Recycling,
} from '@mui/icons-material';
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListSubheader,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import DishzeroSidebarLogo from '../assets/dishzero-sidebar-logo.png';
import { useAuth } from '../contexts/AuthContext';

export const SIDEBAR_WIDTH = 250;

const paperSx = {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: 'grey.800',
    borderRight: 'none',
};

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function NavItem({ to, icon, label, onClick }: NavItemProps) {
    const location = useLocation();
    const active = location.pathname === to;
    const color = active ? 'primary.main' : 'white';

    return (
        <ListItemButton component={Link} to={to} onClick={onClick} sx={{ mb: 0.5, mx: 1 }}>
            <ListItemIcon sx={{ color, minWidth: 40 }}>{icon}</ListItemIcon>
            <Typography variant="body2" color={color} fontWeight={active ? 600 : 400}>
                {label}
            </Typography>
        </ListItemButton>
    );
}

export default function Sidebar() {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isAdmin = currentUser?.role === 'admin';
    const isVolunteer = currentUser?.role === 'volunteer' || isAdmin;

    const closeMobileDrawer = () => setMobileOpen(false);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const showUserSectionHeading = isVolunteer || isAdmin;

    const drawerHeader = (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img alt="DishZero" src={DishzeroSidebarLogo} width={43} height={43} />
                <Typography variant="h6" color="white" fontWeight={700}>
                    DishZero
                </Typography>
            </Box>
            {!isDesktop && mobileOpen && (
                <IconButton onClick={closeMobileDrawer} sx={{ color: 'white' }} aria-label="Close menu" size="small">
                    <CloseIcon />
                </IconButton>
            )}
        </Box>
    );

    const drawerContent = (
        <>
            {drawerHeader}
            <Divider sx={{ borderColor: 'grey.700' }} />

            <List dense sx={{ py: 1 }}>
                {showUserSectionHeading && (
                    <ListSubheader
                        component="div"
                        sx={{ bgcolor: 'transparent', color: 'grey.400', typography: 'caption', fontWeight: 600 }}>
                        User
                    </ListSubheader>
                )}
                <NavItem to="/home" icon={<Home />} label="Home" onClick={closeMobileDrawer} />
                <NavItem to="/borrow" icon={<Bento />} label="Borrow" onClick={closeMobileDrawer} />

                {isVolunteer && (
                    <>
                        <ListSubheader
                            component="div"
                            sx={{
                                bgcolor: 'transparent',
                                color: 'grey.400',
                                typography: 'caption',
                                fontWeight: 600,
                                pt: 1,
                            }}>
                            Volunteer
                        </ListSubheader>
                        <NavItem
                            to="/volunteer/return"
                            icon={<AssignmentTurnedIn />}
                            label="Return"
                            onClick={closeMobileDrawer}
                        />
                    </>
                )}

                {isAdmin && (
                    <>
                        <ListSubheader
                            component="div"
                            sx={{
                                bgcolor: 'transparent',
                                color: 'grey.400',
                                typography: 'caption',
                                fontWeight: 600,
                                pt: 1,
                            }}>
                            Admin
                        </ListSubheader>
                        <NavItem to="/admin" icon={<Home />} label="Home" onClick={closeMobileDrawer} />
                        <NavItem to="/admin/dishes" icon={<Bento />} label="Dishes" onClick={closeMobileDrawer} />
                        <NavItem to="/admin/users" icon={<Person2 />} label="Users" onClick={closeMobileDrawer} />
                        <NavItem to="/admin/email" icon={<EmailIcon />} label="Email" onClick={closeMobileDrawer} />
                    </>
                )}
            </List>

            <Box sx={{ flex: 1 }} />
            <Divider sx={{ borderColor: 'grey.700' }} />
            <List dense sx={{ py: 1 }}>
                <ListItemButton
                    component="a"
                    href="https://www.dishzero.ca/how-it-works-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mb: 0.5, mx: 1 }}
                    onClick={closeMobileDrawer}>
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        <PsychologyAlt />
                    </ListItemIcon>
                    <Typography variant="body2" color="white">
                        How it works
                    </Typography>
                </ListItemButton>
                <ListItemButton
                    component="a"
                    href="https://www.dishzero.ca/impact"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mb: 0.5, mx: 1 }}
                    onClick={closeMobileDrawer}>
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        <Recycling />
                    </ListItemIcon>
                    <Typography variant="body2" color="white">
                        Our impact
                    </Typography>
                </ListItemButton>
            </List>
            <Divider sx={{ borderColor: 'grey.700' }} />
            <List dense>
                <ListItemButton
                    component={Link}
                    to="/login"
                    onClick={() => {
                        closeMobileDrawer();
                        logout();
                    }}
                    sx={{ mx: 1, mb: 1 }}>
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        <Logout />
                    </ListItemIcon>
                    <Typography variant="body2" color="white">
                        Logout
                    </Typography>
                </ListItemButton>
            </List>
        </>
    );

    if (isDesktop) {
        return (
            <Drawer
                variant="permanent"
                sx={{
                    width: SIDEBAR_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        ...paperSx,
                        position: 'relative',
                        height: '100vh',
                        overflowY: 'auto',
                    },
                }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                    {drawerContent}
                </Box>
            </Drawer>
        );
    }

    return (
        <>
            {!mobileOpen && (
                <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{
                        position: 'fixed',
                        left: 12,
                        top: 12,
                        zIndex: theme.zIndex.drawer + 1,
                        bgcolor: 'grey.800',
                        color: 'white',
                        '&:hover': { bgcolor: 'grey.700' },
                    }}
                    aria-label="Open menu">
                    <MenuIcon />
                </IconButton>
            )}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={closeMobileDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{
                    '& .MuiDrawer-paper': {
                        ...paperSx,
                        top: 0,
                        left: 0,
                        height: '100%',
                    },
                }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                    {drawerContent}
                </Box>
            </Drawer>
        </>
    );
}
