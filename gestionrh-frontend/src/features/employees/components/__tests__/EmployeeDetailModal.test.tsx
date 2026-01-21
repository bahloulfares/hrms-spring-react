import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeDetailModal } from '../EmployeeDetailModal';
import * as employeeApi from '../../api';
import toast from 'react-hot-toast';

vi.mock('../../api');
vi.mock('react-hot-toast');

const mockEmployee = {
  id: 1,
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com',
  telephone: '0612345678',
  poste: 'Développeur',
  departement: 'IT',
  nomComplet: 'Jean Dupont',
  roles: [],
  actif: true,
  dateCreation: '2024-01-15',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('EmployeeDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <EmployeeDetailModal isOpen={false} employeeId={null} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show loading state when fetching employee', () => {
    vi.mocked(employeeApi.getEmployee).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display employee details when loaded', async () => {
    vi.mocked(employeeApi.getEmployee).mockResolvedValue(mockEmployee);

    render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Développeur').length).toBeGreaterThan(0);
    expect(screen.getByText('jean.dupont@example.com')).toBeInTheDocument();
    expect(screen.getByText('0612345678')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText('Actif')).toBeInTheDocument();
  });

  it('should show error message when fetch fails', async () => {
    vi.mocked(employeeApi.getEmployee).mockRejectedValue(new Error('Network error'));

    render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/Erreur de chargement/i)).toBeInTheDocument();
    });
  });

  it('should toggle edit mode when modifier button clicked', async () => {
    vi.mocked(employeeApi.getEmployee).mockResolvedValue(mockEmployee);

    render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Modifier/i });
    fireEvent.click(editButton);

    // Should show input fields in edit mode
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nom de famille')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Prénom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
  });

  it('should update input values in edit mode', async () => {
    vi.mocked(employeeApi.getEmployee).mockResolvedValue(mockEmployee);

    render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Modifier/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nom de famille')).toBeInTheDocument();
    });

    const nomInput = screen.getByPlaceholderText('Nom de famille') as HTMLInputElement;
    fireEvent.change(nomInput, { target: { value: 'Martin' } });

    expect(nomInput.value).toBe('Martin');
  });

  it('should call updateEmployee when save button clicked', async () => {
    vi.mocked(employeeApi.getEmployee).mockResolvedValue(mockEmployee);
    vi.mocked(employeeApi.updateEmployee).mockResolvedValue({
      ...mockEmployee,
      nom: 'Martin',
    });

    render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Modifier/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nom de famille')).toBeInTheDocument();
    });

    const nomInput = screen.getByPlaceholderText('Nom de famille');
    fireEvent.change(nomInput, { target: { value: 'Martin' } });

    const saveButton = screen.getByRole('button', { name: /Enregistrer/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(employeeApi.updateEmployee).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          nom: 'Martin',
        })
      );
    });
  });

  it('should show success toast after successful update', async () => {
    vi.mocked(employeeApi.getEmployee).mockResolvedValue(mockEmployee);
    vi.mocked(employeeApi.updateEmployee).mockResolvedValue(mockEmployee);

    render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Modifier/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Enregistrer/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Employé mis à jour avec succès');
    });
  });

  it('should cancel edit mode when annuler button clicked', async () => {
    vi.mocked(employeeApi.getEmployee).mockResolvedValue(mockEmployee);

    render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Modifier/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    fireEvent.click(cancelButton);

    // Should go back to view mode
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Modifier/i })).toBeInTheDocument();
    });

    expect(screen.queryByPlaceholderText('Nom de famille')).not.toBeInTheDocument();
  });

  it('should call onClose when modal is closed', async () => {
    const onCloseMock = vi.fn();
    vi.mocked(employeeApi.getEmployee).mockResolvedValue(mockEmployee);

    const { rerender } = render(
      <EmployeeDetailModal isOpen={true} employeeId={1} onClose={onCloseMock} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    // Simulate closing modal
    rerender(
      <EmployeeDetailModal isOpen={false} employeeId={1} onClose={onCloseMock} />
    );

    // Modal should not be rendered
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
  });
});
