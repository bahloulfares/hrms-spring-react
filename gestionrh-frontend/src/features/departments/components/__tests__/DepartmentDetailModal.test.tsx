import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DepartmentDetailModal } from '../DepartmentDetailModal';
import * as departmentApi from '../../api';
import toast from 'react-hot-toast';
import type { Departement } from '../../types';

vi.mock('../../api');
vi.mock('react-hot-toast');

const mockDepartment: Departement = {
  id: 1,
  nom: 'IT',
  description: 'Département informatique',
  managerId: 5,
  managerNom: 'Jean Dupont',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
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

describe('DepartmentDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <DepartmentDetailModal isOpen={false} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show loading state when fetching department', () => {
    vi.mocked(departmentApi.getDepartement).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display department details when loaded', async () => {
    vi.mocked(departmentApi.getDepartement).mockResolvedValue(mockDepartment);

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('IT').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Département informatique')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('should show error message when fetch fails', async () => {
    const error = new Error('Erreur de chargement');
    vi.mocked(departmentApi.getDepartement).mockRejectedValue(error);

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Erreur de chargement').length).toBeGreaterThan(0);
    });
  });

  it('should toggle edit mode when modifier button clicked', async () => {
    vi.mocked(departmentApi.getDepartement).mockResolvedValue(mockDepartment);

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('IT').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  it('should update input values in edit mode', async () => {
    vi.mocked(departmentApi.getDepartement).mockResolvedValue(mockDepartment);

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('IT').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    const nomInput = screen.getByDisplayValue('IT');
    fireEvent.change(nomInput, { target: { value: 'Informatique' } });

    expect(nomInput).toHaveValue('Informatique');
  });

  it('should call updateDepartement when save button clicked', async () => {
    vi.mocked(departmentApi.getDepartement).mockResolvedValue(mockDepartment);
    vi.mocked(departmentApi.updateDepartement).mockResolvedValue({
      ...mockDepartment,
      nom: 'Informatique',
    });

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('IT').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    const nomInput = screen.getByDisplayValue('IT');
    fireEvent.change(nomInput, { target: { value: 'Informatique' } });

    const saveButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(departmentApi.updateDepartement).toHaveBeenCalledWith(1, {
        nom: 'Informatique',
        description: 'Département informatique',
        managerId: 5,
      });
    });
  });

  it('should show success toast after successful update', async () => {
    vi.mocked(departmentApi.getDepartement).mockResolvedValue(mockDepartment);
    vi.mocked(departmentApi.updateDepartement).mockResolvedValue(mockDepartment);

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('IT').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    const saveButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Département mis à jour avec succès');
    });
  });

  it('should cancel edit mode when annuler button clicked', async () => {
    vi.mocked(departmentApi.getDepartement).mockResolvedValue(mockDepartment);

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('IT').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    fireEvent.click(cancelButton);

    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument();
  });

  it('should call onClose when modal is closed', async () => {
    const onClose = vi.fn();
    vi.mocked(departmentApi.getDepartement).mockResolvedValue(mockDepartment);

    render(
      <DepartmentDetailModal isOpen={true} departmentId={1} onClose={onClose} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('IT').length).toBeGreaterThan(0);
    });

    const closeButton = screen.getByRole('button', { name: /fermer/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
