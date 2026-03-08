import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
vi.mock('../../components/Sidebar', () => ({
    __esModule: true,
    default: () => <div>Sidebar</div>,
    SIDEBAR_WIDTH: 300,
}));

beforeEach(() => {
    renderDesktop = true;
    renderMobile = false;
});

const renderAdminRoute = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/admin" element={<Admin />}>
                    <Route index element={<div>Admin home page</div>} />
                    <Route path="dishes" element={<div>Admin dishes page</div>} />
                    <Route path="users" element={<div>Admin users page</div>} />
                    <Route path="email" element={<div>Admin email page</div>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

test('renders the desktop admin route content', async () => {
    renderAdminRoute('/admin/users');

    expect(await screen.findByText('Admin users page')).toBeInTheDocument();
});

test('renders the admin home content at /admin', async () => {
    renderAdminRoute('/admin');

    expect(await screen.findByText('Admin home page')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
});

test('renders admin dishes route on desktop', async () => {
    render(
        <MemoryRouter initialEntries={['/admin/dishes']}>
            <Routes>
                <Route path="/admin" element={<Admin />}>
                    <Route index element={<div>Admin home page</div>} />
                    <Route path="dishes" element={<div>Admin dishes page</div>} />
                    <Route path="users" element={<div>Admin users page</div>} />
                    <Route path="email" element={<div>Admin email page</div>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

    expect(await screen.findByText('Admin dishes page')).toBeInTheDocument();
});

test('renders admin email route on desktop', async () => {
    render(
        <MemoryRouter initialEntries={['/admin/email']}>
            <Routes>
                <Route path="/admin" element={<Admin />}>
                    <Route index element={<div>Admin home page</div>} />
                    <Route path="dishes" element={<div>Admin dishes page</div>} />
                    <Route path="users" element={<div>Admin users page</div>} />
                    <Route path="email" element={<div>Admin email page</div>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

    expect(await screen.findByText('Admin email page')).toBeInTheDocument();
});

test('renders the mobile warning instead of desktop content on mobile', async () => {
    renderDesktop = false;
    renderMobile = true;

    render(
        <MemoryRouter initialEntries={['/admin/users']}>
            <Routes>
                <Route path="/admin" element={<Admin />}>
                    <Route path="users" element={<div>Admin users page</div>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

    expect(
        await screen.findByText("You're on mobile! Please go to desktop to view admin panel."),
    ).toBeInTheDocument();
    expect(screen.queryByText('Admin users page')).not.toBeInTheDocument();
});
