import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JobDetailModal } from '../JobDetailModal';
import * as jobApi from '../../api';
import toast from 'react-hot-toast';
import type { Poste } from '../../types';

vi.mock('../../api');
vi.mock('react-hot-toast');

const mockJob: Poste = {
  id: 1,
  titre: 'Développeur Full Stack',
  description: 'Développeur expérimenté en React et Spring Boot',
  salaireMin: 40000,
  salaireMax: 60000,
  departementId: 2,
  departementNom: 'IT',
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

describe('JobDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <JobDetailModal isOpen={false} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show loading state when fetching job', () => {
    vi.mocked(jobApi.getPoste).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display job details when loaded', async () => {
    vi.mocked(jobApi.getPoste).mockResolvedValue(mockJob);

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Développeur Full Stack').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Développeur expérimenté en React et Spring Boot')).toBeInTheDocument();
    expect(screen.getAllByText('IT').length).toBeGreaterThan(0);
    expect(screen.getByText(/40 000 DT/)).toBeInTheDocument();
    expect(screen.getByText(/60 000 DT/)).toBeInTheDocument();
  });

  it('should show error message when fetch fails', async () => {
    const error = new Error('Erreur de chargement');
    vi.mocked(jobApi.getPoste).mockRejectedValue(error);

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Erreur de chargement').length).toBeGreaterThan(0);
    });
  });

  it('should toggle edit mode when modifier button clicked', async () => {
    vi.mocked(jobApi.getPoste).mockResolvedValue(mockJob);

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Développeur Full Stack').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  it('should update input values in edit mode', async () => {
    vi.mocked(jobApi.getPoste).mockResolvedValue(mockJob);

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Développeur Full Stack').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    const titreInput = screen.getByDisplayValue('Développeur Full Stack');
    fireEvent.change(titreInput, { target: { value: 'Senior Développeur' } });

    expect(titreInput).toHaveValue('Senior Développeur');
  });

  it('should call updatePoste when save button clicked', async () => {
    vi.mocked(jobApi.getPoste).mockResolvedValue(mockJob);
    vi.mocked(jobApi.updatePoste).mockResolvedValue({
      ...mockJob,
      titre: 'Senior Développeur',
    });

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Développeur Full Stack').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    const titreInput = screen.getByDisplayValue('Développeur Full Stack');
    fireEvent.change(titreInput, { target: { value: 'Senior Développeur' } });

    const saveButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(jobApi.updatePoste).toHaveBeenCalledWith(1, {
        titre: 'Senior Développeur',
        description: 'Développeur expérimenté en React et Spring Boot',
        salaireMin: 40000,
        salaireMax: 60000,
        departementId: 2,
      });
    });
  });

  it('should show success toast after successful update', async () => {
    vi.mocked(jobApi.getPoste).mockResolvedValue(mockJob);
    vi.mocked(jobApi.updatePoste).mockResolvedValue(mockJob);

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Développeur Full Stack').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    const saveButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Poste mis à jour avec succès');
    });
  });

  it('should cancel edit mode when annuler button clicked', async () => {
    vi.mocked(jobApi.getPoste).mockResolvedValue(mockJob);

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Développeur Full Stack').length).toBeGreaterThan(0);
    });

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    fireEvent.click(cancelButton);

    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument();
  });

  it('should call onClose when modal is closed', async () => {
    const onClose = vi.fn();
    vi.mocked(jobApi.getPoste).mockResolvedValue(mockJob);

    render(
      <JobDetailModal isOpen={true} jobId={1} onClose={onClose} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Développeur Full Stack').length).toBeGreaterThan(0);
    });

    const closeButton = screen.getByRole('button', { name: /fermer/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
