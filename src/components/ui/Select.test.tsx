import { render, screen } from '@testing-library/react';
import { Select } from './Select';
import { describe, it, expect } from 'vitest';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
];

describe('Select', () => {
  it('associates label with select', () => {
    render(<Select label="Test Select" options={options} />);
    const select = screen.getByLabelText('Test Select');
    expect(select).toBeInTheDocument();
  });
});
