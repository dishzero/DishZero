import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import Admin from '../Admin';

let renderDesktop = true;
let renderMobile = false;

vi.mock('react-device-detect', () => ({
    BrowserView: ({ children }: { children: ReactNode }) => (renderDesktop ? <>{children}</> : null),
    MobileView: ({ children }: { children: ReactNode }) => (renderMobile ? <>{children}</> : null),
}));

vi.mock('../../admin/UserPage/AdminUserPage', () => ({
    default: () => <div>Admin users page</div>,
}));
vi.mock('../../admin/AdminHome/AdminHomePage', () => ({
    default: () => <div>Admin home page</div>,
}));
vi.mock('../../admin/DishesPage/AdminDishesPage', () => ({
    default: () => <div>Admin dishes page</div>,
}));
vi.mock('../../admin/EmailPage/Email', () => ({
    default: () => <div>Admin email page</div>,
}));
vi.mock('../../admin/AdminSidebar/AdminSidebar', () => ({
    default: () => <div>Admin sidebar</div>,
    SIDEBAR_WIDTH: '300px',
}));

beforeEach(() => {
    renderDesktop = true;
    renderMobile = false;
});

test('renders the desktop admin route content', async () => {
    render(
        <BrowserRouter>
            <Admin path="users" />
        </BrowserRouter>,
    );

    expect(await screen.findByText('Admin users page')).toBeInTheDocument();
});

test('renders the admin home content when no path is provided', async () => {
    render(
        <BrowserRouter>
            <Admin />
        </BrowserRouter>,
    );

    expect(await screen.findByText('Admin home page')).toBeInTheDocument();
    expect(screen.getByText('Admin sidebar')).toBeInTheDocument();
});

test('renders the other admin routes on desktop', async () => {
    const { rerender } = render(
        <BrowserRouter>
            <Admin path="dishes" />
        </BrowserRouter>,
    );

    expect(await screen.findByText('Admin dishes page')).toBeInTheDocument();

    rerender(
        <BrowserRouter>
            <Admin path="email" />
        </BrowserRouter>,
    );

    expect(await screen.findByText('Admin email page')).toBeInTheDocument();
});

test('renders the mobile warning instead of desktop content on mobile', async () => {
    renderDesktop = false;
    renderMobile = true;

    render(
        <BrowserRouter>
            <Admin path="users" />
        </BrowserRouter>,
    );

    expect(await screen.findByText("You're on mobile! Please go to desktop to view admin panel.")).toBeInTheDocument();
    expect(screen.queryByText('Admin users page')).not.toBeInTheDocument();
});
