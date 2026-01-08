import '@testing-library/jest-dom/vitest';
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import React from 'react';

// Extend vitest matchers with jest-axe
expect.extend(toHaveNoViolations);

// Mock Framer Motion to skip animations in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ initial, animate, transition, ...props }: any, ref: any) => 
      React.createElement('div', { ...props, ref })
    ),
    fieldset: React.forwardRef(({ initial, animate, transition, ...props }: any, ref: any) => 
      React.createElement('fieldset', { ...props, ref })
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));
