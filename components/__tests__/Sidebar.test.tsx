import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// shared mutable mocks
const router = { push: vi.fn() } as { push: (...args: any[]) => void };
let authMock: any = { user: { username: 'User', role: 'Staff' }, logout: vi.fn() };
let pathname = '/';

vi.mock('next/navigation', () => ({ useRouter: () => router, usePathname: () => pathname }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authMock }));

import Sidebar from '../../components/Sidebar';

describe('Sidebar', () => {
  afterEach(() => {
    router.push = vi.fn();
    authMock = { user: { username: 'User', role: 'Staff' }, logout: vi.fn() };
    pathname = '/';
    vi.restoreAllMocks();
  });

  test('renders menu items and user info', () => {
    authMock.user = { id: 1, username: 'joko', role: 'admin' };
    pathname = '/categories';

    render(<Sidebar />);

    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/joko/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  test('logout calls logout and redirects', () => {
    const logoutSpy = vi.fn();
    authMock.logout = logoutSpy;
    pathname = '/';

    render(<Sidebar />);

    fireEvent.click(screen.getByText(/Logout/i));

    expect(logoutSpy).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/login');
  });
});
