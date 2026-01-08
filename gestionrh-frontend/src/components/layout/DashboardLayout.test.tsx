import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DashboardLayout } from './DashboardLayout';
import authReducer from '../../features/auth/authSlice';

// Mock the Outlet component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet</div>,
  };
});

function createTestStore(preloadedState?: any) {
  return configureStore({
    reducer: {
      auth: authReducer,
    } as any,
    preloadedState,
  });
}

function createWrapper(preloadedState?: any) {
  const store = createTestStore(preloadedState);
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
}

const mockUser = {
  id: '1',
  nomComplet: 'John Doe',
  email: 'john@example.com',
  roles: ['ADMIN'],
};

const preloadedState = {
  auth: {
    user: mockUser,
    token: 'test-token',
    isLoading: false,
    error: null,
  },
};

describe('DashboardLayout - Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have aria-current="page" on active navigation link', () => {
    window.history.pushState({}, 'Test', '/dashboard');
    
    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const homeLink = screen.getByText('Accueil').closest('a');
    expect(homeLink).toHaveAttribute('aria-current', 'page');

    const employeesLink = screen.getByText('Employés').closest('a');
    expect(employeesLink).not.toHaveAttribute('aria-current');
  });

  it('should close user menu with Escape key', async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    // Open menu
    const menuButton = screen.getByLabelText(/Menu utilisateur/);
    await user.click(menuButton);

    // Verify menu is open
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Menu should be closed (role menu should not exist)
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('should restore focus to menu button after closing with Escape', async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const menuButton = screen.getByLabelText(/Menu utilisateur/);
    
    // Open menu
    await user.click(menuButton);

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Focus should be on menu button
    await waitFor(() => {
      expect(document.activeElement).toBe(menuButton);
    });
  });

  it('should have aria-expanded attribute on menu button', async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const menuButton = screen.getByLabelText(/Menu utilisateur/);
    
    // Initially closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    await user.click(menuButton);

    // Should be expanded
    await waitFor(() => {
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    // Close menu
    await user.click(menuButton);

    // Should be collapsed again
    await waitFor(() => {
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('should have aria-haspopup="menu" on user menu button', () => {
    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const menuButton = screen.getByLabelText(/Menu utilisateur/);
    expect(menuButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('should have aria-controls="user-menu" linking button to menu', async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const menuButton = screen.getByLabelText(/Menu utilisateur/);
    expect(menuButton).toHaveAttribute('aria-controls', 'user-menu');

    // Open menu
    await user.click(menuButton);

    // Menu should have matching id
    await waitFor(() => {
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('id', 'user-menu');
    });
  });

  it('should have focus:ring-2 focus:ring-blue-500 for keyboard focus visibility on menu button', () => {
    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const menuButton = screen.getByLabelText(/Menu utilisateur/);
    const classes = menuButton.className;
    
    expect(classes).toContain('focus:outline-none');
    expect(classes).toContain('focus:ring-2');
    expect(classes).toContain('focus:ring-blue-500');
  });

  it('should have role="menu" on dropdown menu', async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const menuButton = screen.getByLabelText(/Menu utilisateur/);
    await user.click(menuButton);

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('should have role="menuitem" on profile and settings menu items', async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const menuButton = screen.getByLabelText(/Menu utilisateur/);
    await user.click(menuButton);

    const profileItem = screen.getByText('Mon Profil');
    const settingsItem = screen.getByText('Paramètres');

    expect(profileItem).toHaveAttribute('role', 'menuitem');
    expect(settingsItem).toHaveAttribute('role', 'menuitem');
  });

  it('should have aria-hidden="true" on decorative icons', () => {
    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const decorativeIcons = document.querySelectorAll('[aria-hidden="true"]');
    expect(decorativeIcons.length).toBeGreaterThan(0);
  });

  it('should have aria-label on search input', () => {
    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const searchInput = screen.getByLabelText('Rechercher dans l\'application');
    expect(searchInput).toBeInTheDocument();
  });

  it('should have aria-label on notification button', () => {
    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const notificationButton = screen.getByLabelText('Notifications');
    expect(notificationButton).toBeInTheDocument();
  });

  it('should have aria-label and aria-controls on mobile menu button', () => {
    render(<DashboardLayout />, {
      wrapper: createWrapper(preloadedState),
    });

    const mobileMenuButton = screen.getByLabelText(/Ouvrir le menu|Fermer le menu/);
    expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-nav');
    expect(mobileMenuButton).toHaveAttribute('aria-expanded');
  });
});
