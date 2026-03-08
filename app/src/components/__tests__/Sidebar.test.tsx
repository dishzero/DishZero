import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { vi } from 'vitest';

import * as AuthContextModule from '../../contexts/AuthContext';
import theme from '../../theme';
import Sidebar from '../Sidebar';

const useAuthMock = vi.spyOn(AuthContextModule, 'useAuth');

const renderSidebar = (role: 'customer' | 'admin' | 'volunteer') => {
    useAuthMock.mockReturnValue({
        currentUser: {
            id: 'mocked-user-id',
            role,
            email: 'mocked-email@ualberta.ca',
        },
        sessionToken: 'mocked-session-token',
        login: vi.fn(),
        logout: vi.fn(),
    });

    render(
        <ThemeProvider theme={theme}>
            <Router>
                <Sidebar />
            </Router>
        </ThemeProvider>,
    );
};

afterEach(() => {
    vi.clearAllMocks();
});

test('renders the shared sidebar navigation', async () => {
    renderSidebar('admin');

    expect(await screen.findByText('DishZero')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Logout')).toBeInTheDocument();
});

test('hides volunteer and admin sections for customers', async () => {
    renderSidebar('customer');

    expect(await screen.findByText('How it works')).toBeInTheDocument();
    expect(screen.queryByText('User')).not.toBeInTheDocument();
    expect(screen.queryByText('Volunteer')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Return')).not.toBeInTheDocument();
});

test('shows volunteer section for volunteer users', async () => {
    renderSidebar('volunteer');

    expect(await screen.findByText('Volunteer')).toBeInTheDocument();
    expect(screen.getByText('Return')).toBeInTheDocument();
});

test('shows volunteer and admin sections for admins', async () => {
    renderSidebar('admin');

    expect(await screen.findByText('Volunteer')).toBeInTheDocument();
    expect(screen.getByText('Return')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Dishes')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
});

test('uses the expected customer navigation targets', async () => {
    renderSidebar('customer');

    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks[0].closest('a')).toHaveAttribute('href', '/home');
    expect(screen.getByText('How it works').closest('a')).toHaveAttribute(
        'href',
        'https://www.dishzero.ca/how-it-works-1',
    );
    expect(screen.getByText('Our impact').closest('a')).toHaveAttribute(
        'href',
        'https://www.dishzero.ca/impact',
    );
    expect(screen.getByText('Logout').closest('a')).toHaveAttribute('href', '/login');
});

test('uses the expected volunteer navigation targets', async () => {
    renderSidebar('volunteer');

    expect(screen.getByText('Return').closest('a')).toHaveAttribute('href', '/volunteer/return');
});

test('uses the expected admin navigation targets', async () => {
    renderSidebar('admin');

    expect(screen.getByText('Dishes').closest('a')).toHaveAttribute('href', '/admin/dishes');
    expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/admin/users');
    expect(screen.getByText('Email').closest('a')).toHaveAttribute('href', '/admin/email');
});
