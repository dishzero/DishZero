import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import adminApi from '../../admin/adminApi';
import * as AuthContextModule from '../../contexts/AuthContext';
import { backendAddress } from '../../config/env';
import { DishStatus } from '../../types';
import Return from '../Return';

vi.mock('axios');
vi.mock('../../admin/adminApi', () => ({
    default: {
        getDishByQid: vi.fn(),
    },
}));
vi.mock('notistack', () => ({
    useSnackbar: () => ({
        enqueueSnackbar: vi.fn(),
    }),
}));
vi.mock('../../components/CameraScanner', () => ({
    default: ({ onSubmit }: { onSubmit: (value: string) => void }) => (
        <button data-testid="camera-submit" onClick={() => onSubmit('scanner-6')}>
            Scan
        </button>
    ),
}));
vi.mock('../../admin/DishesPage/CustomDialogTitle', () => ({
    default: ({
        open,
        dialogTitle,
        children,
    }: {
        open: boolean;
        dialogTitle: string;
        children: ReactNode;
    }) =>
        open ? (
            <div>
                <div>{dialogTitle}</div>
                {children}
            </div>
        ) : null,
}));

const useAuthMock = vi.spyOn(AuthContextModule, 'useAuth');
const mockPost = vi.mocked(axios.post);
const mockedAdminApi = vi.mocked(adminApi);

const renderReturn = () =>
    render(
        <MemoryRouter>
            <Return noTimer={true} />
        </MemoryRouter>,
    );

beforeEach(() => {
    mockPost.mockReset();
    mockedAdminApi.getDishByQid.mockReset();

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
});

afterEach(() => {
    vi.clearAllMocks();
});

test('renders the return page input', async () => {
    renderReturn();

    expect(await screen.findByPlaceholderText('Enter dish id #')).toBeInTheDocument();
});

test('returns a borrowed dish and opens the success popup', async () => {
    mockedAdminApi.getDishByQid.mockResolvedValueOnce({
        id: 'dish-1',
        qid: 6,
        type: 'plate',
        status: DishStatus.borrowed,
    } as never);
    mockPost.mockResolvedValueOnce({ status: 200, data: {} });

    renderReturn();

    const input = await screen.findByPlaceholderText('Enter dish id #');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(screen.getByTestId('return-btn'));

    await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(
            `/api/dish/return`,
            {
                returned: {
                    condition: 'good',
                },
            },
            {
                headers: {
                    'session-token': 'mocked-session-token',
                    'Content-Type': 'application/json',
                },
                params: { qid: '6' },
                baseURL: backendAddress,
            },
        );
    });

    expect(await screen.findByText('Successfully returned')).toBeInTheDocument();
    expect(screen.getByText('Plate #6')).toBeInTheDocument();
});

test('allows reporting a returned dish condition', async () => {
    mockedAdminApi.getDishByQid.mockResolvedValueOnce({
        id: 'dish-1',
        qid: 6,
        type: 'plate',
        status: DishStatus.borrowed,
    } as never);
    mockPost.mockResolvedValueOnce({ status: 200, data: {} });
    mockPost.mockResolvedValueOnce({ status: 200, data: { message: 'condition updated' } });

    renderReturn();

    const input = await screen.findByPlaceholderText('Enter dish id #');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(screen.getByTestId('return-btn'));

    fireEvent.click(await screen.findByTestId('open-report-modal-btn'));
    fireEvent.click(screen.getByTestId('end-report-btn'));

    await waitFor(() => {
        expect(mockPost).toHaveBeenLastCalledWith(
            `/api/dish/condition`,
            {
                condition: 'small_crack_chip',
            },
            {
                headers: {
                    'session-token': 'mocked-session-token',
                    'Content-Type': 'application/json',
                },
                baseURL: backendAddress,
                params: {
                    id: 'dish-1',
                },
            },
        );
    });

    expect(await screen.findByText('Condition updated')).toBeInTheDocument();
});

test('shows the backend error when a return fails', async () => {
    mockedAdminApi.getDishByQid.mockResolvedValueOnce({
        id: 'dish-1',
        qid: 6,
        type: 'mug',
        status: DishStatus.borrowed,
    } as never);
    mockPost.mockRejectedValueOnce({
        response: {
            data: {
                message: 'Dish cannot be returned yet',
            },
        },
    });

    renderReturn();

    const input = await screen.findByPlaceholderText('Enter dish id #');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(screen.getByTestId('return-btn'));

    expect(await screen.findByText('Failed to return')).toBeInTheDocument();
    expect(screen.getByText('Dish cannot be returned yet')).toBeInTheDocument();
    expect(screen.getByText('Please scan and try again')).toBeInTheDocument();
});

test('prompts to force sign in when the dish is not currently borrowed', async () => {
    mockedAdminApi.getDishByQid.mockResolvedValueOnce({
        id: 'dish-1',
        qid: 6,
        type: 'plate',
        status: DishStatus.available,
    } as never);

    renderReturn();

    const input = await screen.findByPlaceholderText('Enter dish id #');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(screen.getByTestId('return-btn'));

    expect(await screen.findByText('Dish is not signed out')).toBeInTheDocument();
    expect(screen.getByText('Force Sign In Dish')).toBeInTheDocument();
});

test('can force sign in a dish and then return it', async () => {
    mockedAdminApi.getDishByQid.mockResolvedValueOnce({
        id: 'dish-1',
        qid: 6,
        type: 'plate',
        status: DishStatus.available,
    } as never);
    mockPost.mockResolvedValueOnce({ status: 200, data: {} });
    mockPost.mockResolvedValueOnce({ status: 200, data: {} });

    renderReturn();

    const input = await screen.findByPlaceholderText('Enter dish id #');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(screen.getByTestId('return-btn'));
    fireEvent.click(await screen.findByText('Force Sign In Dish'));

    await waitFor(() => {
        expect(mockPost).toHaveBeenNthCalledWith(1, `${backendAddress}/api/dish/borrow`, {}, {
            headers: { 'session-token': 'mocked-session-token' },
            params: { qid: '6', email: 'dishzero@ualberta.ca' },
        });
    });

    await waitFor(() => {
        expect(mockPost).toHaveBeenNthCalledWith(
            2,
            `/api/dish/return`,
            {
                returned: {
                    condition: 'good',
                },
            },
            {
                headers: {
                    'session-token': 'mocked-session-token',
                    'Content-Type': 'application/json',
                },
                params: { qid: '6' },
                baseURL: backendAddress,
            },
        );
    });
    expect(await screen.findByText('Successfully returned')).toBeInTheDocument();
});
