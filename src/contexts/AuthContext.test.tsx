import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../lib/supabaseClient', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignOut = vi.fn();
  const mockGetSession = vi.fn();
  const mockOnAuthStateChange = vi.fn((_cb: unknown) => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  }));
  const supabase: any = {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (cb: any) => mockOnAuthStateChange(cb),
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signInWithOtp: vi.fn(),
      signOut: () => mockSignOut(),
    },
  };
  return {
    __mocks: { mockSignIn, mockSignUp, mockSignOut, mockGetSession, mockOnAuthStateChange },
    supabase,
  };
});

vi.mock('../lib/sentry', () => ({
  setUser: vi.fn(),
  clearUser: vi.fn(),
}));

import { AuthProvider, useAuth } from './AuthContext';
import * as supabaseClientModule from '../lib/supabaseClient';
const mocks = (supabaseClientModule as any).__mocks;

function Probe() {
  const { user, loading, signInWithPassword } = useAuth();
  if (loading) return <div>loading</div>;
  return (
    <div>
      <div data-testid="email">{user?.email ?? 'guest'}</div>
      <button onClick={() => signInWithPassword('me@x.fr', 'pw12345678')}>login</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((m: any) => m.mockReset?.());
    mocks.mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  it('renders guest when no session', async () => {
    mocks.mockGetSession.mockResolvedValue({ data: { session: null } });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('guest'));
  });

  it('calls supabase signInWithPassword on login', async () => {
    mocks.mockGetSession.mockResolvedValue({ data: { session: null } });
    mocks.mockSignIn.mockResolvedValue({ error: null });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => screen.getByText('login'));
    await userEvent.click(screen.getByText('login'));
    expect(mocks.mockSignIn).toHaveBeenCalledWith({ email: 'me@x.fr', password: 'pw12345678' });
  });
});
