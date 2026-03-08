import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import * as AuthContextModule from '../../../contexts/AuthContext';
import adminApi from '../../adminApi';
import AdminUserTable from '../AdminUserTable';

const enqueueSnackbar = vi.fn();

vi.mock('../../adminApi', () => ({
    default: {
        modifyRole: vi.fn(),
    },
}));
vi.mock('notistack', () => ({
    useSnackbar: () => ({
        enqueueSnackbar,
    }),
}));
vi.mock('../../components/StyledDataGrid', () => ({
    default: ({
        rows,
        columns,
        processRowUpdate,
    }: {
        rows: Array<{ userId: string; email: string; role: string }>;
        columns: Array<{ field: string; headerName: string }>;
        processRowUpdate: (newRow: Record<string, unknown>, oldRow: Record<string, unknown>) => Promise<unknown>;
    }) => (
        <div>
            {columns.map((column) => (
                <div key={column.field}>{column.headerName}</div>
            ))}
            {rows.map((row) => (
                <div key={row.userId}>{row.email}</div>
            ))}
            <button
                data-testid="change-role"
                onClick={async () => {
                    await processRowUpdate({ ...rows[0], role: 'volunteer' }, rows[0]);
                }}>
                Change role
            </button>
            <button
                data-testid="same-role"
                onClick={async () => {
                    await processRowUpdate({ ...rows[0] }, rows[0]);
                }}>
                Same role
            </button>
        </div>
    ),
}));

const useAuthMock = vi.spyOn(AuthContextModule, 'useAuth');
const mockedAdminApi = vi.mocked(adminApi);

const rows = [
    {
        userId: 'user-1',
        email: 'hello@ualberta.ca',
        inUse: 2,
        overdue: 1,
        role: 'customer',
    },
];

beforeEach(() => {
    enqueueSnackbar.mockReset();
    mockedAdminApi.modifyRole.mockReset();

    useAuthMock.mockReturnValue({
        currentUser: {
            id: 'admin-1',
            role: 'admin',
            email: 'admin@dishzero.ca',
        },
        sessionToken: 'mocked-session-token',
        login: vi.fn(),
        logout: vi.fn(),
    });
});

test('renders the expected user table columns and rows', () => {
    render(<AdminUserTable filteredRows={rows} loadingUsers={false} />);

    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('hello@ualberta.ca')).toBeInTheDocument();
});

test('submits a role change through the admin api', async () => {
    mockedAdminApi.modifyRole.mockResolvedValueOnce({
        status: 200,
    } as never);

    render(<AdminUserTable filteredRows={rows} loadingUsers={false} />);
    fireEvent.click(screen.getByTestId('change-role'));

    await waitFor(() => {
        expect(mockedAdminApi.modifyRole).toHaveBeenCalledWith(
            'mocked-session-token',
            'user-1',
            'volunteer',
            'hello@ualberta.ca',
        );
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith('Successfully updated user', { variant: 'success' });
});

test('does not call the admin api when the role has not changed', async () => {
    render(<AdminUserTable filteredRows={rows} loadingUsers={false} />);
    fireEvent.click(screen.getByTestId('same-role'));

    await waitFor(() => {
        expect(mockedAdminApi.modifyRole).not.toHaveBeenCalled();
    });
});

test('shows an error snackbar when role updates fail', async () => {
    mockedAdminApi.modifyRole.mockResolvedValueOnce({
        status: 500,
        message: 'Update rejected',
        response: {
            data: {
                message: 'role conflict',
            },
        },
    } as never);

    render(<AdminUserTable filteredRows={rows} loadingUsers={false} />);
    fireEvent.click(screen.getByTestId('change-role'));

    await waitFor(() => {
        expect(enqueueSnackbar).toHaveBeenCalledWith('Failed to modify user: Update rejected; role conflict', {
            variant: 'error',
        });
    });
});
