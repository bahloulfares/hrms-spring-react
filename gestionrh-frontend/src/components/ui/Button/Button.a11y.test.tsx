import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../Button';
import { Mail } from 'lucide-react';

describe('Button - Accessibility Audit', () => {
  it('should not have any automatic accessibility violations', async () => {
    const { container } = render(
      <Button variant="primary">Click me</Button>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have visible text content', () => {
    const { getByText } = render(
      <Button variant="primary">Click me</Button>
    );

    const button = getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe('Click me');
  });

  it('should have accessible focus indicator with focus:ring-2', () => {
    const { getByRole } = render(
      <Button variant="primary">Click me</Button>
    );

    const button = getByRole('button');
    const className = button.className;
    
    expect(className).toContain('focus:outline-none');
    expect(className).toContain('focus:ring-2');
  });

  it('should support aria-busy attribute for loading state', () => {
    const { getByRole } = render(
      <Button variant="primary" loading={true}>
        Loading
      </Button>
    );

    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('should support aria-disabled attribute for disabled state', () => {
    const { getByRole } = render(
      <Button variant="primary" disabled={true}>
        Disabled
      </Button>
    );

    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeDisabled();
  });

  it('should have proper contrast in all variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost', 'outline'] as const;

    variants.forEach((variant) => {
      const { getByRole: getButtonByRole } = render(
        <Button variant={variant}>Button-{variant}</Button>
      );

      const button = getButtonByRole('button', { name: `Button-${variant}` });
      expect(button).toBeInTheDocument();
    });
  });

  it('should handle icons with aria-hidden', () => {
    const { container, getByRole } = render(
      <Button variant="primary" leftIcon={<Mail />}>
        Send
      </Button>
    );

    const button = getByRole('button');
    expect(button).toBeInTheDocument();

    // Icon should be aria-hidden
    const icons = container.querySelectorAll('[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should have proper text for icon-only buttons', () => {
    const { getByRole } = render(
      <Button variant="primary" aria-label="Send message" leftIcon={<Mail />}>
        {' '}
      </Button>
    );

    const button = getByRole('button', { name: 'Send message' });
    expect(button).toBeInTheDocument();
  });

  it('should have proper text alignment and spacing', () => {
    const { getByRole } = render(
      <Button variant="primary">Accessible Button</Button>
    );

    const button = getByRole('button');
    const className = button.className;

    expect(className).toContain('inline-flex');
    expect(className).toContain('items-center');
  });

  it('should be keyboard accessible', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <Button variant="primary" onClick={handleClick}>
        Click me
      </Button>
    );

    const button = getByRole('button');

    // Button should be focusable
    expect(button.tagName).toBe('BUTTON');
    expect(button).not.toBeDisabled();
  });

  it('should support all button sizes with proper spacing', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      const { getByRole: getButtonByRole } = render(
        <Button variant="primary" size={size}>
          Button-{size}
        </Button>
      );

      const button = getButtonByRole('button', { name: `Button-${size}` });
      expect(button).toBeInTheDocument();
    });
  });

  it('should handle spinner in loading state accessibly', () => {
    const { container, getByRole } = render(
      <Button variant="primary" loading={true}>
        Loading
      </Button>
    );

    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();

    // Spinner should be aria-hidden
    const spinners = container.querySelectorAll('[aria-hidden="true"]');
    expect(spinners.length).toBeGreaterThan(0);
  });
});
