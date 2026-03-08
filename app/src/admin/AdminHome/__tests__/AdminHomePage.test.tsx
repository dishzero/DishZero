import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import * as AuthContextModule from '../../../contexts/AuthContext';
import adminApi from '../../adminApi';
import AdminHomePage from '../AdminHomePage';

vi.mock('../../adminApi', () => ({
    default: {
        getTransactions: vi.fn(),
        getDishTypes: vi.fn(),
    },
}));
vi.mock('../AdminTransactionsTable', () => ({
    default: ({
        filteredRows,
        dishTypes,
    }: {
        filteredRows: Array<{ id: string; transactionType: string; userEmail: string }>;
        dishTypes: string[];
    }) => (
        <div>
            <div data-testid="dish-types">{dishTypes.join(',')}</div>
            {filteredRows.map((row) => (
                <div key={`${row.id}-${row.transactionType}`}>{row.userEmail}</div>
            ))}
        </div>
    ),
}));

const useAuthMock = vi.spyOn(AuthContextModule, 'useAuth');
const mockedAdminApi = vi.mocked(adminApi);

beforeEach(() => {
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

    mockedAdminApi.getTransactions.mockResolvedValue([
        {
            id: 'tx-1',
            dish: {
                qid: 101,
                type: 'mug',
            },
            user: {
                email: 'borrower@dishzero.ca',
            },
            timestamp: '2024-01-01T00:00:00.000Z',
            returned: {
                timestamp: '2024-01-02T00:00:00.000Z',
                email: 'returner@dishzero.ca',
            },
        },
        {
            id: 'tx-2',
            dish: {
                qid: 202,
                type: 'plate',
            },
            user: {
                email: 'active@dishzero.ca',
            },
            timestamp: '2024-01-03T00:00:00.000Z',
            returned: {
                timestamp: '',
            },
        },
    ] as never);
    mockedAdminApi.getDishTypes.mockResolvedValue(['mug', 'plate'] as never);
});

afterEach(() => {
    vi.clearAllMocks();
});

test('renders transaction stats and the transformed transaction rows', async () => {
    render(<AdminHomePage />);

    expect(await screen.findByText('Transactions')).toBeInTheDocument();
    expect(await screen.findByText('borrower@dishzero.ca')).toBeInTheDocument();
    expect(screen.getByText('Total Borrowed')).toBeInTheDocument();
    expect(screen.getByText('Currently In Use')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2);
    expect(screen.getByTestId('dish-types')).toHaveTextContent('mug,plate');
    expect(screen.getByText('returner@dishzero.ca')).toBeInTheDocument();
    expect(screen.getByText('active@dishzero.ca')).toBeInTheDocument();
});

test('filters visible transactions from the search box', async () => {
    render(<AdminHomePage />);

    expect(await screen.findByText('borrower@dishzero.ca')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search table...'), {
        target: { value: 'active@dishzero.ca' },
    });

    await waitFor(() => {
        expect(screen.getByText('active@dishzero.ca')).toBeInTheDocument();
    });

    expect(screen.queryByText('borrower@dishzero.ca')).not.toBeInTheDocument();
    expect(screen.queryByText('returner@dishzero.ca')).not.toBeInTheDocument();
});
