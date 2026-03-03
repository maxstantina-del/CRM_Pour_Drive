import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadForm } from './LeadForm';

describe('LeadForm', () => {
  it('should disable buttons and show loading state when loading prop is true', () => {
    const handleCancel = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <LeadForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={true}
      />
    );

    // Check Cancel button
    const cancelButton = screen.getByText('Annuler');
    expect(cancelButton).toBeDisabled();

    // Check Submit button (defaults to 'Créer' when no lead provided)
    const submitButton = screen.getByText('Créer');
    expect(submitButton).toBeDisabled();

    // Check for spinner (Button component renders svg when loading)
    // We can look for the SVG element within the button
    const buttonElement = submitButton.closest('button');
    expect(buttonElement?.querySelector('svg')).toBeInTheDocument();
  });

  it('should not be disabled when loading is false', () => {
    const handleCancel = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <LeadForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={false}
      />
    );

    expect(screen.getByText('Annuler')).not.toBeDisabled();
    expect(screen.getByText('Créer')).not.toBeDisabled();
  });
});
