import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// Shared mutable mocks so we can update between tests
const router = { push: vi.fn() } as { push: (...args: any[]) => void };
let authMock: any = { isLoading: true, isAuthenticated: false };

vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authMock }));

import ProtectedRoute from '../../components/ProtectedRoute';

describe('ProtectedRoute', () => {
  afterEach(() => {
    router.push = vi.fn();
    authMock = { isLoading: true, isAuthenticated: false };
    vi.restoreAllMocks();
  });

  test('shows loading when isLoading is true', () => {
    authMock.isLoading = true;

    render(
      // @ts-ignore allow children
      <ProtectedRoute>
        <div>Private</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('redirects to /login when not authenticated', async () => {
    authMock.isLoading = false;
    authMock.isAuthenticated = false;

    render(
      // @ts-ignore allow children
      <ProtectedRoute>
        <div>Private</div>
      </ProtectedRoute>
    );

    // wait one tick for useEffect
    await new Promise((r) => setTimeout(r, 0));

    expect(router.push).toHaveBeenCalledWith('/login');
  });
});
