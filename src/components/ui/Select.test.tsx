/**
 * Tests for Select component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  it('should render select with label', () => {
    render(<Select label="Choose" options={options} />);
    expect(screen.getByLabelText('Choose')).toBeInTheDocument();
  });

  it('should generate an id if not provided', () => {
    render(<Select label="Country" options={options} />);
    const select = screen.getByLabelText('Country');
    expect(select.id).toBeTruthy();
    const label = screen.getByText('Country');
    expect(label).toHaveAttribute('for', select.id);
  });

  it('should use provided id', () => {
    render(<Select id="custom-select-id" label="Custom ID" options={options} />);
    const select = screen.getByLabelText('Custom ID');
    expect(select.id).toBe('custom-select-id');
  });

  it('should render placeholder', () => {
    render(<Select placeholder="Select an option" options={options} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should render options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
});
