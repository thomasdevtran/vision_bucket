import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewForm from './ReviewForm';

describe('ReviewForm', () => {
  it('renders textarea, rating select, and submit button', () => {
    render(<ReviewForm onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText(/write your review/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('calls onSubmit with review text and rating when submitted', () => {
    const onSubmit = jest.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText(/write your review/i), {
      target: { value: 'Great movie!' },
    });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith('Great movie!', 4);
  });

  it('resets fields to empty after submission', () => {
    render(<ReviewForm onSubmit={() => {}} />);
    const textarea = screen.getByPlaceholderText(/write your review/i) as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: 'Amazing!' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(textarea.value).toBe('');
  });
});
