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

test('submits trimmed review content with a server-valid rating and no spoiler flag by default', async () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  render(<ReviewForm onSubmit={onSubmit} />);

  fireEvent.change(screen.getByPlaceholderText('What did you think?'), {
    target: { value: '  A sharp, memorable film.  ' },
  });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } });
  fireEvent.click(screen.getByRole('button', { name: /post review/i }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('A sharp, memorable film.', 4, false));
});

test('marks the review as a spoiler when the checkbox is ticked', async () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  render(<ReviewForm onSubmit={onSubmit} />);

  fireEvent.change(screen.getByPlaceholderText('What did you think?'), {
    target: { value: 'The killer was the butler.' },
  });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '5' } });
  fireEvent.click(screen.getByRole('checkbox', { name: /contains spoilers/i }));
  fireEvent.click(screen.getByRole('button', { name: /post review/i }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('The killer was the butler.', 5, true));
});
