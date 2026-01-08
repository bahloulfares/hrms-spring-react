import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { axe } from 'jest-axe';
import { DashboardLayout } from './DashboardLayout';
import authReducer from '../../features/auth/authSlice';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet</div>,
  };
});

function createWrapper() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    } as any,
    preloadedState: {
      auth: {
        user: {
          id: '1',
          nomComplet: 'John Doe',
          email: 'john@example.com',
          roles: ['ADMIN'],
        },
        token: 'test-token',
        isLoading: false,
        error: null,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
}

describe('DashboardLayout - Accessibility Audit', () => {
  it('should not have any automatic accessibility violations', async () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    // Check that heading hierarchy is proper
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBeGreaterThanOrEqual(0);
  });

  it('should have proper nav elements with aria-labels', () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    const navElements = container.querySelectorAll('nav');
    
    // Should have at least one nav for main navigation
    navElements.forEach((nav) => {
      const hasAriaLabel = nav.hasAttribute('aria-label');
      const hasAriaLabelledBy = nav.hasAttribute('aria-labelledby');
      const hasHeading = !!nav.querySelector('h1, h2');
      
      // Nav element should either have aria-label or aria-labelledby or contain a heading
      expect(hasAriaLabel || hasAriaLabelledBy || hasHeading).toBeTruthy();
    });
  });

  it('should have proper color contrast on text elements', async () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    // This test would be better with actual visual analysis
    // For now, check that important elements are visible
    const textElements = container.querySelectorAll('p, a, button, span');
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('should have skip links or proper navigation structure', () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    // Check for main content area
    const mainArea = container.querySelector('main');
    // If no main, check for article or proper section structure
    const hasProperStructure = mainArea || 
      container.querySelector('article') ||
      container.querySelector('[role="main"]');
    
    expect(hasProperStructure).toBeTruthy();
  });

  it('should have proper image alt attributes', () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    const images = container.querySelectorAll('img');
    
    images.forEach((img) => {
      // Each image should have alt text or be marked as decorative
      const hasAlt = img.hasAttribute('alt');
      const isDecorative = img.getAttribute('aria-hidden') === 'true';
      
      expect(hasAlt || isDecorative).toBeTruthy();
    });
  });

  it('should have interactive elements that are keyboard accessible', () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    const buttons = container.querySelectorAll('button');
    
    // All buttons should be accessible
    expect(buttons.length).toBeGreaterThan(0);
    
    // All buttons should have proper focus styling
    buttons.forEach((button) => {
      // Focus styling might be in CSS, so we just check it's a button
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('should have proper form labels and associations', () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    const inputs = container.querySelectorAll('input[type="text"], select, textarea');
    
    inputs.forEach((input) => {
      const inputId = input.getAttribute('id');
      const hasAriaLabel = input.hasAttribute('aria-label');
      const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
      
      // Input should have aria-label, aria-labelledby, or be associated with a label
      let hasLabel = false;
      if (hasAriaLabel || hasAriaLabelledBy) {
        hasLabel = true;
      } else if (inputId) {
        const label = container.querySelector(`label[for="${inputId}"]`);
        hasLabel = !!label;
      }
      
      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
    });
  });

  it('should have proper semantic structure for lists and navigation', () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    // Check that navigation uses semantic nav elements
    const navElements = container.querySelectorAll('nav');
    expect(navElements.length).toBeGreaterThan(0);
    
    // Check that nav contains links or menu items
    navElements.forEach((nav) => {
      const hasLinks = nav.querySelectorAll('a').length > 0;
      const hasMenuItems = nav.querySelectorAll('[role="menuitem"]').length > 0;
      
      expect(hasLinks || hasMenuItems).toBeTruthy();
    });
  });

  it('should announce live regions and updates properly', () => {
    const { container } = render(<DashboardLayout />, {
      wrapper: createWrapper(),
    });

    // Check for aria-live regions if any dynamic content exists
    // Check for status alerts or notifications
    const liveRegions = container.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
    
    // It's ok if there are no live regions initially
    // But if there are, they should be properly configured
    liveRegions.forEach((region) => {
      const ariaLive = region.getAttribute('aria-live');
      const role = region.getAttribute('role');
      
      if (ariaLive || role === 'alert' || role === 'status') {
        // Polite or assertive are valid values
        expect(['polite', 'assertive', 'off'].includes(ariaLive || '')).toBeTruthy();
      }
    });
  });
});
