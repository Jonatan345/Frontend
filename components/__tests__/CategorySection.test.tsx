import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategorySection from '../../components/CategorySection';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

beforeEach(() => {
  // stub global fetch for kategori and menu endpoints
  vi.stubGlobal('fetch', vi.fn((url: any) => {
    const s = String(url);
    if (s.endsWith('/api/kategori')) {
      return Promise.resolve({ ok: true, json: async () => [{ id: 1, name: 'Meat' }] });
    }
    if (s.endsWith('/api/menu')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders heading and opens add modal', async () => {
  render(<CategorySection />);

  expect(await screen.findByText(/Category Dashboard/i)).toBeInTheDocument();

  const addBtn = screen.getByRole('button', { name: /Add Category/i });
  fireEvent.click(addBtn);

  // assert modal heading is present (disambiguates multiple "Add Category" texts)
  expect(await screen.findByRole('heading', { name: /Add Category/i })).toBeInTheDocument();
});
