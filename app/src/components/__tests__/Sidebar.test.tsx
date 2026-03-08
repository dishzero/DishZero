import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { vi } from 'vitest';

import * as AuthContextModule from '../../contexts/AuthContext';
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
        <Router>
            <Sidebar />
        </Router>,
    );
};

afterEach(() => {
    vi.clearAllMocks();
});

test('renders the shared sidebar navigation', async () => {
    renderSidebar('admin');

    expect(await screen.findByText('DishZero')).toBeInTheDocument();
    expect(screen.getByText('MENU')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
});

test('hides volunteer and admin links for customers', async () => {
    renderSidebar('customer');

    expect(await screen.findByText('How it works')).toBeInTheDocument();
    expect(screen.queryByText('VOLUNTEERS')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin panel')).not.toBeInTheDocument();
    expect(screen.queryByText('Return Dishes')).not.toBeInTheDocument();
});

test('shows volunteer links for volunteer users', async () => {
    renderSidebar('volunteer');

    expect(await screen.findByText('VOLUNTEERS')).toBeInTheDocument();
    expect(screen.getByText('Admin panel')).toBeInTheDocument();
    expect(screen.getByText('Return Dishes')).toBeInTheDocument();
});

test('shows volunteer links for admins', async () => {
    renderSidebar('admin');

    expect(await screen.findByText('VOLUNTEERS')).toBeInTheDocument();
    expect(screen.getByText('Admin panel')).toBeInTheDocument();
    expect(screen.getByText('Return Dishes')).toBeInTheDocument();
});

test('uses the expected customer navigation targets', async () => {
    renderSidebar('customer');

    expect((await screen.findByText('Home')).closest('a')).toHaveAttribute('href', '/home');
    expect(screen.getByText('How it works').closest('a')).toHaveAttribute('href', 'https://www.dishzero.ca/how-it-works-1');
    expect(screen.getByText('Our impact').closest('a')).toHaveAttribute('href', 'https://www.dishzero.ca/impact');
    expect(screen.getByText('Logout').closest('a')).toHaveAttribute('href', '/login');
});

test('uses the expected volunteer navigation targets', async () => {
    renderSidebar('volunteer');

    expect((await screen.findByText('Admin panel')).closest('a')).toHaveAttribute('href', '/admin');
    expect(screen.getByText('Return Dishes').closest('a')).toHaveAttribute('href', '/volunteer/return');
});
