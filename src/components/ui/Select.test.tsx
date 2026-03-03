/**
 * Tests for Select component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  it('should render select with label', () => {
    render(<Select label="Choose Option" options={options} />);
    expect(screen.getByLabelText('Choose Option')).toBeInTheDocument();
  });

  it('should use provided id if given', () => {
    render(<Select label="Choose Option" options={options} id="custom-select-id" />);
    const select = screen.getByLabelText('Choose Option');
    expect(select).toHaveAttribute('id', 'custom-select-id');
  });

  it('should render placeholder option', () => {
    render(
      <Select label="Choose" options={options} placeholder="Select an option" />
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should render helper text', () => {
    render(
      <Select label="Choose" options={options} helperText="Help text here" />
    );
    expect(screen.getByText('Help text here')).toBeInTheDocument();
  });

  it('should render error message', () => {
    render(
      <Select label="Choose" options={options} error="Selection required" />
    );
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });
});
