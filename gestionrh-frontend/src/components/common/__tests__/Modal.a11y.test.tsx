import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Modal } from '../Modal';

describe('Modal - Accessibility Audit', () => {
  it('should not have any automatic accessibility violations', async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper dialog role and aria-modal', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should have proper aria-labelledby pointing to title', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

    const title = container.querySelector('#modal-title');
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe('Test Modal');
  });

  it('should have proper aria-describedby for content', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');

    const description = container.querySelector('#modal-description');
    expect(description).toBeTruthy();
  });

  it('should have aria-hidden overlay for background', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const overlay = container.querySelector('.bg-opacity-75');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have proper button for closing modal', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeButton = container.querySelector('button');
    expect(closeButton).toBeTruthy();
    expect(closeButton?.textContent).toContain('Fermer');
  });

  it('should have visible focus indicator on close button', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeButton = container.querySelector('button');
    const className = closeButton?.className || '';
    
    // Should have focus styling
    expect(className).toContain('focus:');
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should have proper heading structure in modal', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Modal Title">
        <div>
          <h4>Subheading</h4>
          <p>Content</p>
        </div>
      </Modal>
    );

    const mainTitle = container.querySelector('#modal-title');
    const subheading = container.querySelector('h4');

    expect(mainTitle).toBeTruthy();
    expect(subheading).toBeTruthy();
  });

  it('should have text content readable by screen readers', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Test content for screen readers</p>
      </Modal>
    );

    const contentArea = container.querySelector('#modal-description');
    expect(contentArea?.textContent).toContain('Test content for screen readers');
  });
});
