/**
 * Tests for Input and Textarea components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input, Textarea } from './Input';

describe('Input', () => {
  it('should render input with label', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('should generate an id if not provided', () => {
    render(<Input label="Username" />);
    const input = screen.getByLabelText('Username');
    expect(input.id).toBeTruthy();
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('should use provided id', () => {
    render(<Input id="custom-id" label="Custom ID" />);
    const input = screen.getByLabelText('Custom ID');
    expect(input.id).toBe('custom-id');
  });

  it('should render error message', () => {
    render(<Input error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300');
  });

  it('should render helper text', () => {
    render(<Input helperText="We will never share your email" />);
    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
  });

  it('should not render helper text if error is present', () => {
    render(<Input error="Error" helperText="Helper" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
  });

  it('should render with icon', () => {
    const icon = <span data-testid="input-icon">📧</span>;
    render(<Input icon={icon} />);
    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('pl-10');
  });

  it('should handle disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should forward refs', () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe('Textarea', () => {
  it('should render textarea with label', () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('should generate an id if not provided', () => {
    render(<Textarea label="Comment" />);
    const textarea = screen.getByLabelText('Comment');
    expect(textarea.id).toBeTruthy();
    const label = screen.getByText('Comment');
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('should use provided id', () => {
    render(<Textarea id="custom-textarea-id" label="Custom ID" />);
    const textarea = screen.getByLabelText('Custom ID');
    expect(textarea.id).toBe('custom-textarea-id');
  });

  it('should render error message', () => {
    render(<Textarea error="Too long" />);
    expect(screen.getByText('Too long')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300');
  });

  it('should forward refs', () => {
    const ref = { current: null };
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
