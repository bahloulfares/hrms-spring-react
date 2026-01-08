import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Input } from './Input';
import { Search, Mail } from 'lucide-react';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input field', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input label="Username" />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should associate label with input via htmlFor', () => {
      render(<Input label="Email" id="email-input" />);
      
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should generate unique id if not provided', () => {
      const { rerender } = render(<Input label="Field 1" />);
      const input1 = screen.getByRole('textbox');
      const id1 = input1.getAttribute('id');
      
      rerender(<Input label="Field 2" />);
      const input2 = screen.getByRole('textbox');
      const id2 = input2.getAttribute('id');
      
      expect(id1).not.toBe(id2);
    });

    it('should show required asterisk when required', () => {
      render(<Input label="Required Field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render with default variant', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-200');
    });

    it('should render with error variant when error prop is provided', () => {
      render(<Input error="This field is required" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-300', 'bg-red-50');
    });

    it('should render with success variant', () => {
      render(<Input variant="success" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-300', 'bg-green-50');
    });
  });

  describe('Sizes', () => {
    it('should render with default medium size', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-4', 'py-2.5');
    });

    it('should render with small size', () => {
      render(<Input size="sm" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should render with large size', () => {
      render(<Input size="lg" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-5', 'py-3', 'text-lg');
    });
  });

  describe('Icons', () => {
    it('should render with left icon', () => {
      render(
        <Input 
          leftIcon={<Search data-testid="search-icon" />}
          placeholder="Search"
        />
      );
      
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should add left padding when left icon is present', () => {
      render(
        <Input 
          leftIcon={<Search data-testid="search-icon" />}
          placeholder="Search"
        />
      );
      
      const input = screen.getByPlaceholderText('Search');
      expect(input).toHaveClass('pl-10');
    });

    it('should render with right icon', () => {
      render(
        <Input 
          rightIcon={<Mail data-testid="mail-icon" />}
          placeholder="Email"
        />
      );
      
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('should add right padding when right icon is present', () => {
      render(
        <Input 
          rightIcon={<Mail data-testid="mail-icon" />}
          placeholder="Email"
        />
      );
      
      const input = screen.getByPlaceholderText('Email');
      expect(input).toHaveClass('pr-10');
    });

    it('should hide right icon and show error icon when error exists', () => {
      render(
        <Input 
          rightIcon={<Mail data-testid="mail-icon" />}
          error="Invalid email"
        />
      );
      
      expect(screen.queryByTestId('mail-icon')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should set aria-invalid when error exists', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error message with input via aria-describedby', () => {
      render(<Input id="test-input" error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });

    it('should show error message with role="alert"', () => {
      render(<Input error="Error occurred" />);
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Error occurred');
    });

    it('should override variant to error when error prop is provided', () => {
      render(<Input variant="success" error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-300');
      expect(input).not.toHaveClass('border-green-300');
    });
  });

  describe('Helper Text', () => {
    it('should display helper text', () => {
      render(<Input helperText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('should associate helper text with input via aria-describedby', () => {
      render(<Input id="test-input" helperText="Helper text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
    });

    it('should hide helper text when error is present', () => {
      render(
        <Input 
          helperText="This is helper text" 
          error="This is an error"
        />
      );
      
      expect(screen.queryByText('This is helper text')).not.toBeInTheDocument();
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('should render as input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
    });

    it('should render email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render date input', () => {
      render(<Input type="date" />);
      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should have opacity-50 class when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('User Interaction', () => {
    it('should update value on change', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(handleChange).toHaveBeenCalled();
      expect(input.value).toBe('test value');
    });

    it('should call onFocus when focused', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Forward Ref', () => {
    it('should forward ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });

    it('should allow focus via ref', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should accept wrapperClassName', () => {
      render(<Input wrapperClassName="wrapper-class" label="Test" />);
      const wrapper = screen.getByText('Test').parentElement;
      expect(wrapper).toHaveClass('wrapper-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Input 
          label="Username"
          required
          error="Required field"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      expect(input).toHaveAttribute('required');
    });
  });
});
