import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuCard from '../../components/MenuCard';
import { expect, test, vi } from 'vitest';

test('renders menu card and triggers handlers', () => {
  const onDelete = vi.fn();
  const onEdit = vi.fn();

  render(
    <MenuCard name="Nasi Goreng" price="25000" img="/nasi.jpg" onDelete={onDelete} onEdit={onEdit} />
  );

  expect(screen.getByText(/Nasi Goreng/i)).toBeInTheDocument();
  expect(screen.getByText(/Rp 25000/)).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Edit/));
  expect(onEdit).toHaveBeenCalled();

  fireEvent.click(screen.getByText(/Delete/));
  expect(onDelete).toHaveBeenCalled();
});
