import { render, screen, within } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { vi } from 'vitest';

import * as AuthContextModule from '../../contexts/AuthContext';
import Homepage from '../Home';

vi.mock('axios');

const mockGet = vi.mocked(axios.get);
const useAuthMock = vi.spyOn(AuthContextModule, 'useAuth');

const baseAuthState = {
    currentUser: {
        id: 'mocked-user-id',
        role: 'customer',
        email: 'mocked-email@ualberta.ca',
    },
    sessionToken: 'mocked-session-token',
    login: vi.fn(),
    logout: vi.fn(),
};

const renderHome = () =>
    render(
        <Router>
            <Homepage />
        </Router>,
    );

afterEach(() => {
    vi.clearAllMocks();
});

test('renders the new-user homepage state', async () => {
    useAuthMock.mockReturnValue(baseAuthState);
    mockGet.mockResolvedValueOnce({ data: { transactions: [] } });

    renderHome();

    expect(await screen.findByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Our Impact')).toBeInTheDocument();
    expect(
        screen.getByText("You don't have any dishes borrowed at the moment. Start borrowing to make an impact!"),
    ).toBeInTheDocument();
    expect(screen.getByText('Borrow').closest('a')).toHaveAttribute('href', '/borrow');

    const externalLinks = screen.getAllByAltText('External Link');
    expect(externalLinks[0].closest('a')).toHaveAttribute('href', 'https://www.dishzero.ca/how-it-works-1');
    expect(externalLinks[1].closest('a')).toHaveAttribute('href', 'https://www.dishzero.ca/impact');
    expect(screen.getByAltText('scan icon').closest('a')).toHaveAttribute('href', '/borrow');
});

test('renders existing-user stats from transactions', async () => {
    useAuthMock.mockReturnValue(baseAuthState);
    mockGet.mockResolvedValueOnce({
        data: {
            transactions: [
                {
                    id: '1',
                    dish: { qid: 123, id: 'dish1', type: 'mug' },
                    returned: { condition: 'good', timestamp: '' },
                    timestamp: '2023-11-11T02:40:20.230Z',
                    user: { email: 'user@example.com', id: 'user123', role: 'customer' },
                },
                {
                    id: '2',
                    dish: { qid: 122, id: 'dish2', type: 'plate' },
                    returned: { condition: 'good', timestamp: '2023-11-12T02:40:20.230Z' },
                    timestamp: '2023-11-11T02:40:20.230Z',
                    user: { email: 'user@example.com', id: 'user123', role: 'customer' },
                },
            ],
        },
    });
    mockGet.mockResolvedValueOnce({
        data: {
            dish: {
                qid: 123,
                type: 'mug',
            },
        },
    });

    renderHome();

    expect(await screen.findByText('My Impact')).toBeInTheDocument();
    expect(screen.getByTestId('returned-dishes-count')).toHaveTextContent('1');
    expect(screen.getByTestId('waste-diverted-amt')).toHaveTextContent('0.5');
    expect(screen.getByText('1 in use')).toBeInTheDocument();
});

test('renders dish cards for unreturned dishes', async () => {
    useAuthMock.mockReturnValue(baseAuthState);
    mockGet.mockResolvedValueOnce({
        data: {
            transactions: [
                {
                    id: '1',
                    dish: { qid: 123, id: 'dish1', type: 'mug' },
                    returned: { condition: 'good', timestamp: '' },
                    timestamp: '2023-11-11T02:40:20.230Z',
                    user: { email: 'user@example.com', id: 'user123', role: 'customer' },
                },
            ],
        },
    });
    mockGet.mockResolvedValueOnce({
        data: {
            dish: {
                qid: 123,
                type: 'mug',
            },
        },
    });

    renderHome();

    const dishCard = await screen.findByTestId('dish-card');
    expect(within(dishCard).getByRole('img')).toBeInTheDocument();
    expect(dishCard).toHaveTextContent('Return before');
});
