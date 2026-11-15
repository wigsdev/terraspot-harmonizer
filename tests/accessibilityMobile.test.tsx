import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomCSVModal } from '../src/components/CustomCSVModal';
import { LanguageProvider, RegionProvider } from '../src/context';

describe('Accessibility & Mobile Viewport Audits (T-11)', () => {
  it('renders modal with correct WCAG 2.1 AA dialog role and labels', () => {
    const handleClose = vi.fn();
    const handleApply = vi.fn();

    render(
      <LanguageProvider>
        <RegionProvider>
          <CustomCSVModal
            isOpen={true}
            onClose={handleClose}
            onApplyCustomCube={handleApply}
          />
        </RegionProvider>
      </LanguageProvider>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('custom-csv-modal-title');

    // Escape key dismissal
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('supports backdrop click to dismiss dialog', () => {
    const handleClose = vi.fn();
    const handleApply = vi.fn();

    render(
      <LanguageProvider>
        <RegionProvider>
          <CustomCSVModal
            isOpen={true}
            onClose={handleClose}
            onApplyCustomCube={handleApply}
          />
        </RegionProvider>
      </LanguageProvider>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
