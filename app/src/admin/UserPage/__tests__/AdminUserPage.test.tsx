import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import * as AuthContextModule from '../../../contexts/AuthContext';
import adminApi from '../../adminApi';
import AdminUserPage from '../AdminUserPage';

vi.mock('../../adminApi', () => ({
    default: {
        getDishesStatusForEachUser: vi.fn(),
    },
}));
vi.mock('../AdminUserTable', () => ({
    default: ({ filteredRows }: { filteredRows: Array<{ email: string }> }) => (
        <div>
            <div>Visible rows</div>
            {filteredRows.map((row) => (
                <div key={row.email}>{row.email}</div>
            ))}
        </div>
    ),
}));

const useAuthMock = vi.spyOn(AuthContextModule, 'useAuth');
const mockedAdminApi = vi.mocked(adminApi);

beforeEach(() => {
    useAuthMock.mockReturnValue({
        currentUser: {
            id: 'mocked-user-id',
            role: 'admin',
            email: 'mocked-email@ualberta.ca',
        },
        sessionToken: 'mocked-session-token',
        login: vi.fn(),
        logout: vi.fn(),
    });

    mockedAdminApi.getDishesStatusForEachUser.mockResolvedValue([
        {
            userId: 'user-1',
            email: 'hello@ualberta.ca',
            inUse: 2,
            overdue: 1,
            role: 'customer',
        },
        {
            userId: 'user-2',
            email: 'admin@ualberta.ca',
            inUse: 0,
            overdue: 0,
            role: 'admin',
        },
    ]);
});

afterEach(() => {
    vi.clearAllMocks();
});

test('renders the admin users page shell', async () => {
    render(
        <BrowserRouter>
            <AdminUserPage />
        </BrowserRouter>,
    );

    expect(await screen.findByText('Users')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search table...')).toBeInTheDocument();
});

test('loads user rows from the admin api', async () => {
    render(
        <BrowserRouter>
            <AdminUserPage />
        </BrowserRouter>,
    );

    expect(await screen.findByText('hello@ualberta.ca')).toBeInTheDocument();
    expect(screen.getByText('admin@ualberta.ca')).toBeInTheDocument();
    expect(mockedAdminApi.getDishesStatusForEachUser).toHaveBeenCalledWith('mocked-session-token');
});

test('filters visible rows when searching by email', async () => {
    render(
        <BrowserRouter>
            <AdminUserPage />
        </BrowserRouter>,
    );

    expect(await screen.findByText('hello@ualberta.ca')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search table...'), {
        target: { value: 'hello' },
    });

    expect(screen.getByText('hello@ualberta.ca')).toBeInTheDocument();
    expect(screen.queryByText('admin@ualberta.ca')).not.toBeInTheDocument();
});
