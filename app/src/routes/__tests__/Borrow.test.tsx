import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import * as AuthContextModule from '../../contexts/AuthContext';
import { backendAddress } from '../../config/env';
import Borrow from '../Borrow';

vi.mock('axios');
vi.mock('react-bootstrap/Modal', () => {
    const Modal = ({ show, children }: { show: boolean; children: ReactNode }) => (show ? <div>{children}</div> : null);

    Modal.Header = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
    Modal.Body = ({ children }: { children?: ReactNode }) => <div>{children}</div>;

    return {
        default: Modal,
    };
});

const mockPost = vi.mocked(axios.post);
const useAuthMock = vi.spyOn(AuthContextModule, 'useAuth');

const renderBorrow = () =>
    render(
        <MemoryRouter>
            <Borrow />
        </MemoryRouter>,
    );

beforeEach(() => {
    window.history.pushState({}, '', '/borrow');
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

test('renders the borrow page input', async () => {
    renderBorrow();

    expect(await screen.findByPlaceholderText('Enter dish id #')).toBeInTheDocument();
});

test('submits a borrow request with the configured backend address', async () => {
    mockPost.mockResolvedValueOnce({ data: { ok: true } });

    renderBorrow();

    const input = await screen.findByPlaceholderText('Enter dish id #');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(screen.getByTestId('return-btn'));

    expect(mockPost).toHaveBeenCalledWith(`${backendAddress}/api/dish/borrow`, {}, {
        headers: { 'session-token': 'mocked-session-token' },
        params: { qid: '6' },
    });
});

test('shows a success confirmation after a successful borrow', async () => {
    mockPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });

    renderBorrow();

    const input = await screen.findByPlaceholderText('Enter dish id #');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.click(screen.getByTestId('return-btn'));

    expect(await screen.findByText('Successfully borrowed')).toBeInTheDocument();
    expect(screen.getByText('Dish # 6')).toBeInTheDocument();
});

test('shows an error confirmation when borrowing fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('network failure'));

    renderBorrow();

    const input = await screen.findByPlaceholderText('Enter dish id #');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.click(screen.getByTestId('return-btn'));

    expect(await screen.findByText('Failed to borrow')).toBeInTheDocument();
    expect(screen.getByText('Dish # 12')).toBeInTheDocument();
    expect(screen.getByText('Please scan and try again')).toBeInTheDocument();
});

test('auto-submits a dish id from a DishZero previous URL redirect', async () => {
    window.history.pushState({}, '', '/borrow?previousURL=https://www.dishzero.ca/borrow?dishID=44');
    mockPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });

    renderBorrow();

    await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(`${backendAddress}/api/dish/borrow`, {}, {
            headers: { 'session-token': 'mocked-session-token' },
            params: { qid: '44' },
        });
    });
});
