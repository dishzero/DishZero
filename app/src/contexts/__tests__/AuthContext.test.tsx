import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { MemoryRouter } from 'react-router-dom';
import { getIdToken, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { vi } from 'vitest';

import { backendAddress } from '../../config/env';
import { AuthProvider, LoginLocation, useAuth } from '../AuthContext';

const { mockNavigate, mockSignOut } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockSignOut: vi.fn(),
}));

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));
vi.mock('js-cookie', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    },
}));
vi.mock('../../firebase', () => ({
    auth: {
        signOut: mockSignOut,
    },
    provider: { providerId: 'ualberta' },
    googleAuthProvider: { providerId: 'google' },
}));
vi.mock('firebase/auth', () => ({
    getIdToken: vi.fn(),
    onAuthStateChanged: vi.fn(),
    signInWithPopup: vi.fn(),
}));
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockGet = vi.mocked(axios.get);
const mockPost = vi.mocked(axios.post);
const mockCookiesGet = vi.mocked(Cookies.get);
const mockCookiesSet = vi.mocked(Cookies.set);
const mockCookiesRemove = vi.mocked(Cookies.remove);
const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);
const mockSignInWithPopup = vi.mocked(signInWithPopup);
const mockGetIdToken = vi.mocked(getIdToken);

function AuthHarness() {
    const { currentUser, sessionToken, login, logout } = useAuth();

    return (
        <div>
            <div data-testid="current-user-email">{currentUser?.email ?? 'none'}</div>
            <div data-testid="current-user-role">{currentUser?.role ?? 'none'}</div>
            <div data-testid="session-token">{sessionToken ?? ''}</div>
            <button onClick={() => login(LoginLocation.Other)}>login-other</button>
            <button onClick={() => login(LoginLocation.UniversityOfAlberta)}>login-uofa</button>
            <button onClick={() => logout()}>logout</button>
        </div>
    );
}

function renderAuthHarness() {
    return render(
        <MemoryRouter>
            <AuthProvider>
                <AuthHarness />
            </AuthProvider>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    mockNavigate.mockReset();
    mockSignOut.mockReset();
    mockGet.mockReset();
    mockPost.mockReset();
    mockCookiesGet.mockReset();
    mockCookiesSet.mockReset();
    mockCookiesRemove.mockReset();
    mockSignInWithPopup.mockReset();
    mockGetIdToken.mockReset();
    mockOnAuthStateChanged.mockReset();

    mockCookiesGet.mockReturnValue(undefined);
    mockOnAuthStateChanged.mockImplementation((_, nextOrObserver) => {
        if (typeof nextOrObserver === 'function') {
            nextOrObserver(null);
        } else {
            nextOrObserver.next?.(null);
        }

        return vi.fn();
    });
});

test('returns the default auth context outside the provider', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.currentUser).toBe(null);
    expect(result.current.sessionToken).toBe('');
});

test('restores a stored session token on startup', async () => {
    mockCookiesGet.mockReturnValue('stored-session-token');
    mockGet.mockResolvedValueOnce({
        status: 200,
        data: {
            user: {
                id: 'user-1',
                role: 'admin',
                email: 'admin@dishzero.ca',
            },
        },
    });

    renderAuthHarness();

    expect(await screen.findByTestId('session-token')).toHaveTextContent('stored-session-token');
});

test('logs in with the general Google provider and persists the session', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({
        user: {
            email: 'user@gmail.com',
        },
    } as never);
    mockGetIdToken.mockResolvedValueOnce('firebase-id-token');
    mockPost.mockResolvedValueOnce({
        data: {
            session: 'server-session-token',
            user: {
                id: 'user-1',
                role: 'customer',
                email: 'user@gmail.com',
            },
        },
    });

    renderAuthHarness();

    fireEvent.click(await screen.findByText('login-other'));

    await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(
            `/api/auth/login/`,
            { idToken: 'firebase-id-token' },
            {
                headers: {},
                baseURL: backendAddress,
            },
        );
    });

    expect(mockCookiesSet).toHaveBeenCalledWith('session-token', 'server-session-token', { expires: 90 });
    expect(mockNavigate).toHaveBeenCalledWith('/home');
    expect(screen.getByTestId('current-user-email')).toHaveTextContent('user@gmail.com');
    expect(screen.getByTestId('session-token')).toHaveTextContent('server-session-token');
});

test('rejects non-UAlberta accounts for the university login flow', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const deleteUser = vi.fn();

    mockSignInWithPopup.mockResolvedValueOnce({
        user: {
            email: 'user@gmail.com',
            delete: deleteUser,
        },
    } as never);
    mockGetIdToken.mockResolvedValueOnce('firebase-id-token');

    renderAuthHarness();

    fireEvent.click(await screen.findByText('login-uofa'));

    await waitFor(() => {
        expect(deleteUser).toHaveBeenCalled();
    });

    expect(alertSpy).toHaveBeenCalledWith('Please login with your University of Alberta CCID');
    expect(mockPost).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    alertSpy.mockRestore();
});

test('logs out using the current session token and clears local state', async () => {
    mockCookiesGet.mockReturnValue('stored-session-token');
    mockGet.mockResolvedValueOnce({
        status: 200,
        data: {
            user: {
                id: 'user-1',
                role: 'admin',
                email: 'admin@dishzero.ca',
            },
        },
    });
    mockPost.mockResolvedValueOnce({
        status: 200,
        data: {},
    });

    renderAuthHarness();

    expect(await screen.findByTestId('session-token')).toHaveTextContent('stored-session-token');

    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(`/api/auth/logout/`, {}, {
            baseURL: backendAddress,
            headers: {
                'session-token': 'stored-session-token',
            },
        });
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockCookiesRemove).toHaveBeenCalledWith('session-token');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(screen.getByTestId('current-user-email')).toHaveTextContent('none');
});
