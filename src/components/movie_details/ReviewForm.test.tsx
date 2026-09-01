import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReviewForm from './ReviewForm';

test('requires a review and a rating before submitting', async () => {
  const onSubmit = jest.fn();
  render(<ReviewForm onSubmit={onSubmit} />);

  fireEvent.click(screen.getByRole('button', { name: /post review/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Write a review');
  expect(onSubmit).not.toHaveBeenCalled();
});

test('submits trimmed review content with a server-valid rating', async () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  render(<ReviewForm onSubmit={onSubmit} />);

  fireEvent.change(screen.getByPlaceholderText('What did you think?'), {
    target: { value: '  A sharp, memorable film.  ' },
  });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } });
  fireEvent.click(screen.getByRole('button', { name: /post review/i }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('A sharp, memorable film.', 4));
});
