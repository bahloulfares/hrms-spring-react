import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Select } from './Select';

describe('Select', () => {
  describe('Rendering', () => {
    it('should render select element', () => {
      render(
        <Select>
          <option value="">Choose</option>
          <option value="1">Option 1</option>
        </Select>
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(
        <Select label="Country">
          <option value="">Choose</option>
        </Select>
      );
      expect(screen.getByText('Country')).toBeInTheDocument();
    });

    it('should associate label with select via htmlFor', () => {
      render(
        <Select label="Region" id="region-select">
          <option value="">Choose</option>
        </Select>
      );
      
      const label = screen.getByText('Region');
      const select = screen.getByRole('combobox');
      
      expect(label).toHaveAttribute('for', 'region-select');
      expect(select).toHaveAttribute('id', 'region-select');
    });

    it('should generate unique id if not provided', () => {
      const { rerender } = render(
        <Select label="Field 1">
          <option value="">Choose</option>
        </Select>
      );
      const select1 = screen.getByRole('combobox');
      const id1 = select1.getAttribute('id');
      
      rerender(
        <Select label="Field 2">
          <option value="">Choose</option>
        </Select>
      );
      const select2 = screen.getByRole('combobox');
      const id2 = select2.getAttribute('id');
      
      expect(id1).not.toBe(id2);
    });

    it('should show required asterisk when required', () => {
      render(
        <Select label="Required Field" required>
          <option value="">Choose</option>
        </Select>
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render options', () => {
      render(
        <Select>
          <option value="">Choose</option>
          <option value="fr">France</option>
          <option value="us">USA</option>
        </Select>
      );
      
      expect(screen.getByRole('option', { name: 'Choose' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'France' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'USA' })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render with default variant', () => {
      render(
        <Select>
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-gray-200');
    });

    it('should render with error variant when error prop is provided', () => {
      render(
        <Select error="Invalid selection">
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-red-300', 'bg-red-50');
    });
  });

  describe('Sizes', () => {
    it('should render with default size (md)', () => {
      render(
        <Select>
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('px-4', 'py-2.5', 'text-base');
    });

    it('should render with small size', () => {
      render(
        <Select size="sm">
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should render with large size', () => {
      render(
        <Select size="lg">
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('px-5', 'py-3', 'text-lg');
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      render(
        <Select error="This field is required">
          <option value="">Choose</option>
        </Select>
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should have aria-invalid when error is present', () => {
      render(
        <Select error="Invalid">
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link error message with aria-describedby', () => {
      render(
        <Select id="test-select" error="Error message">
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
    });

    it('should have role="alert" on error message', () => {
      render(
        <Select error="Error occurred">
          <option value="">Choose</option>
        </Select>
      );
      const errorElement = screen.getByText('Error occurred');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  describe('Helper Text', () => {
    it('should display helper text', () => {
      render(
        <Select helperText="Choose your country">
          <option value="">Choose</option>
        </Select>
      );
      expect(screen.getByText('Choose your country')).toBeInTheDocument();
    });

    it('should link helper text with aria-describedby', () => {
      render(
        <Select id="test-select" helperText="Helper text">
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-helper');
    });

    it('should hide helper text when error is present', () => {
      render(
        <Select error="Error" helperText="Helper text">
          <option value="">Choose</option>
        </Select>
      );
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <Select disabled>
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should have required attribute when required', () => {
      render(
        <Select required>
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
    });
  });

  describe('User Interactions', () => {
    it('should change value when option is selected', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <option value="">Choose</option>
          <option value="fr">France</option>
          <option value="us">USA</option>
        </Select>
      );
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'fr');
      
      expect(select).toHaveValue('fr');
    });

    it('should call onChange handler when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <Select onChange={handleChange}>
          <option value="">Choose</option>
          <option value="fr">France</option>
        </Select>
      );
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'fr');
      
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to select', () => {
      render(
        <Select className="custom-class">
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('custom-class');
    });

    it('should apply wrapperClassName to wrapper div', () => {
      render(
        <Select wrapperClassName="wrapper-custom">
          <option value="">Choose</option>
        </Select>
      );
      const select = screen.getByRole('combobox');
      expect(select.parentElement).toHaveClass('wrapper-custom');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to select element', () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(
        <Select ref={ref}>
          <option value="">Choose</option>
        </Select>
      );
      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });
  });
});
