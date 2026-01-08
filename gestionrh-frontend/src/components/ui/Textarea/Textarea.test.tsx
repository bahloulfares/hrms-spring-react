import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  describe('Rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea placeholder="Enter description" />);
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should associate label with textarea via htmlFor', () => {
      render(<Textarea label="Comments" id="comments-textarea" />);
      
      const label = screen.getByText('Comments');
      const textarea = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', 'comments-textarea');
      expect(textarea).toHaveAttribute('id', 'comments-textarea');
    });

    it('should generate unique id if not provided', () => {
      const { rerender } = render(<Textarea label="Field 1" />);
      const textarea1 = screen.getByRole('textbox');
      const id1 = textarea1.getAttribute('id');
      
      rerender(<Textarea label="Field 2" />);
      const textarea2 = screen.getByRole('textbox');
      const id2 = textarea2.getAttribute('id');
      
      expect(id1).not.toBe(id2);
    });

    it('should show required asterisk when required', () => {
      render(<Textarea label="Required Field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render with default rows (3)', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '3');
    });

    it('should render with custom rows', () => {
      render(<Textarea rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });
  });

  describe('Variants', () => {
    it('should render with default variant', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-gray-200');
    });

    it('should render with error variant when error prop is provided', () => {
      render(<Textarea error="Invalid input" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-red-300', 'bg-red-50');
    });
  });

  describe('Sizes', () => {
    it('should render with default size (md)', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('px-4', 'py-2.5', 'text-base');
    });

    it('should render with small size', () => {
      render(<Textarea size="sm" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should render with large size', () => {
      render(<Textarea size="lg" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('px-5', 'py-3', 'text-lg');
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      render(<Textarea error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should have aria-invalid when error is present', () => {
      render(<Textarea error="Invalid" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link error message with aria-describedby', () => {
      render(<Textarea id="test-textarea" error="Error message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-error');
    });

    it('should have role="alert" on error message', () => {
      render(<Textarea error="Error occurred" />);
      const errorElement = screen.getByText('Error occurred');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  describe('Helper Text', () => {
    it('should display helper text', () => {
      render(<Textarea helperText="Maximum 500 characters" />);
      expect(screen.getByText('Maximum 500 characters')).toBeInTheDocument();
    });

    it('should link helper text with aria-describedby', () => {
      render(<Textarea id="test-textarea" helperText="Helper text" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-helper');
    });

    it('should hide helper text when error is present', () => {
      render(<Textarea error="Error" helperText="Helper text" />);
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should have required attribute when required', () => {
      render(<Textarea required />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('should accept placeholder', () => {
      render(<Textarea placeholder="Enter your text here" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'Enter your text here');
    });
  });

  describe('User Interactions', () => {
    it('should update value when typing', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello World');
      
      expect(textarea).toHaveValue('Hello World');
    });

    it('should call onChange handler when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Textarea onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'A');
      
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should support multiline text', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Enter}Line 2');
      
      expect(textarea).toHaveValue('Line 1\nLine 2');
    });

    it('should call onBlur when losing focus', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      
      render(<Textarea onBlur={handleBlur} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to textarea', () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-class');
    });

    it('should apply wrapperClassName to wrapper div', () => {
      render(<Textarea wrapperClassName="wrapper-custom" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea.parentElement).toHaveClass('wrapper-custom');
    });

    it('should have resize-none class', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-none');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to textarea element', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('should allow calling focus via ref', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes with error', () => {
      render(<Textarea id="desc" label="Description" error="Error" required />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'desc-error');
      expect(textarea).toBeRequired();
    });

    it('should have proper aria attributes with helper text', () => {
      render(<Textarea id="desc" label="Description" helperText="Help" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'desc-helper');
    });
  });
});
