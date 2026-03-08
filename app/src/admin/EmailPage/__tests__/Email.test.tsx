import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { vi } from 'vitest';

import * as AuthContextModule from '../../../contexts/AuthContext';
import Email from '../Email';

vi.mock('axios');

const mockGet = vi.mocked(axios.get);
const useAuthMock = vi.spyOn(AuthContextModule, 'useAuth');

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

    mockGet.mockResolvedValue({
        data: {
            cron: {
                senderEmail: 'sender@dishzero.ca',
                body: 'A mock email body for testing',
                subject: 'A mock email subject for testing',
                expression: '0 0 12 * * WED',
                enabled: true,
            },
        },
        status: 200,
    });
});

afterEach(() => {
    vi.clearAllMocks();
});

test('loads the email template from the backend', async () => {
    render(<Email />);

    expect(await screen.findByDisplayValue('sender@dishzero.ca')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A mock email subject for testing')).toBeInTheDocument();
});
