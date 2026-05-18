import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { rest } from 'msw';
import { server } from '../../mocks/server';

// mock auth to provide token so fetch happens
const authMock = { token: 'test-token', isLoading: false, isAuthenticated: true };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => authMock }));

import CategorySection from '../../components/CategorySection';

describe('CategorySection integration flows', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('loads categories from API (integration via MSW)', async () => {
    render(<CategorySection />);

    expect(await screen.findByText(/Meat/i)).toBeInTheDocument();
    expect(await screen.findByText(/Vegetables/i)).toBeInTheDocument();
  });

  test('creates a new category and displays it', async () => {
    render(<CategorySection />);

    expect(await screen.findByText(/Meat/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }));
    const input = screen.getByPlaceholderText(/e.g. Fresh Ingredients/i);
    fireEvent.change(input, { target: { value: 'Seafood' } });

    const addModalButton = screen.getAllByRole('button', { name: /Add Category/i })[1];
    fireEvent.click(addModalButton);

    expect(await screen.findByText(/Seafood/i)).toBeInTheDocument();
  });

  test('edits an existing category and updates the card', async () => {
    render(<CategorySection />);

    expect(await screen.findByText(/Meat/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Edit kategori Meat/i }));
    const input = screen.getByPlaceholderText(/e.g. Fresh Ingredients/i);
    fireEvent.change(input, { target: { value: 'Poultry' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(await screen.findByText(/Poultry/i)).toBeInTheDocument();
  });

  test('deletes a category after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<CategorySection />);

    expect(await screen.findByText(/Vegetables/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Hapus kategori Vegetables/i }));

    await waitFor(() => expect(screen.queryByText(/Vegetables/i)).not.toBeInTheDocument());
  });

  test('shows API error message when create fails', async () => {
    server.use(
      rest.post('http://localhost:8080/api/kategori', async (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error saat buat kategori.' }));
      })
    );

    render(<CategorySection />);
    expect(await screen.findByText(/Meat/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }));
    fireEvent.change(screen.getByPlaceholderText(/e.g. Fresh Ingredients/i), { target: { value: 'Dry Ingredients' } });
    const addModalButton = screen.getAllByRole('button', { name: /Add Category/i })[1];
    fireEvent.click(addModalButton);

    expect(await screen.findByText(/Server error saat buat kategori\./i)).toBeInTheDocument();
  });

  test('shows API error message when delete fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    server.use(
      rest.delete('http://localhost:8080/api/kategori/:id', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error saat hapus kategori.' }));
      })
    );

    render(<CategorySection />);
    expect(await screen.findByText(/Meat/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Hapus kategori Meat/i }));

    expect(await screen.findByText((content) => content.includes('Server error saat hapus kategori'))).toBeInTheDocument();
    expect(screen.getByText(/Meat/i)).toBeInTheDocument();
  });
});
