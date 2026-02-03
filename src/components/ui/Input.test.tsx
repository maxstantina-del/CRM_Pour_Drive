import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input, Textarea } from './Input';

describe('Input', () => {
  it('should associate label with input using automatically generated ID', () => {
    render(<Input label="Email Address" />);
    // This confirms that clicking the label focuses the input, or that they are programmatically associated
    const input = screen.getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('should respect provided id prop', () => {
    render(<Input label="Username" id="custom-id" />);
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('should render helper text', () => {
    render(<Input label="Password" helperText="Must be 8 chars" />);
    expect(screen.getByText('Must be 8 chars')).toBeInTheDocument();
  });

  it('should render error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveClass('border-red-300');
  });
});

describe('Textarea', () => {
  it('should associate label with textarea using automatically generated ID', () => {
    render(<Textarea label="Comments" />);
    const textarea = screen.getByLabelText('Comments');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should respect provided id prop', () => {
    render(<Textarea label="Description" id="desc-id" />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('id', 'desc-id');
  });
});
