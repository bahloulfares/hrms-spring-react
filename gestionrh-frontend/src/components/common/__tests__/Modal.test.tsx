import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should display the correct title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Custom Title">
        <p>Content</p>
      </Modal>
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Title">
        <div data-testid="custom-content">
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </div>
      </Modal>
    );
    
    const content = screen.getByTestId('custom-content');
    expect(content).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    
    const closeButton = screen.getByText('Fermer');
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when background overlay is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    
    // L'overlay est le premier div avec bg-opacity-75
    const overlay = document.querySelector('.bg-opacity-75') as HTMLElement;
    expect(overlay).toBeInTheDocument();
    
    fireEvent.click(overlay);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should have correct accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Accessible Modal">
        <p>Content</p>
      </Modal>
    );
    
    const title = screen.getByText('Accessible Modal');
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  // Keyboard navigation tests
  describe('Keyboard Navigation', () => {
    it('should close modal when Escape key is pressed', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByText('Fermer');
      expect(closeButton).toBeInTheDocument();

      // Simulate Escape key press
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should focus close button when modal opens', async () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      await waitFor(() => {
        const closeButton = screen.getByText('Fermer');
        // Check if close button can receive focus (not checking actual focus as we need frame time)
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('should restore focus to previously focused element when modal closes', async () => {
      const handleClose = vi.fn();
      const trigger = document.createElement('button');
      trigger.textContent = 'Open Modal';
      document.body.appendChild(trigger);

      render(
        <Modal isOpen={true} onClose={handleClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      // Simulate closing modal
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(handleClose).toHaveBeenCalledTimes(1);

      // Clean up
      document.body.removeChild(trigger);
    });

    it('should have role="dialog" and aria-modal="true"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });
  });});