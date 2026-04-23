import { render, screen } from '@testing-library/react';
import { Input, Textarea } from './Input';
import { describe, it, expect } from 'vitest';

describe('Input', () => {
  it('associates label with input', () => {
    render(<Input label="Test Label" />);
    const input = screen.getByLabelText('Test Label');
    expect(input).toBeInTheDocument();
  });

  it('uses provided id if available', () => {
    render(<Input label="Test Label" id="custom-id" />);
    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('id', 'custom-id');
  });
});

describe('Textarea', () => {
  it('associates label with textarea', () => {
    render(<Textarea label="Test Area" />);
    const area = screen.getByLabelText('Test Area');
    expect(area).toBeInTheDocument();
  });
});
