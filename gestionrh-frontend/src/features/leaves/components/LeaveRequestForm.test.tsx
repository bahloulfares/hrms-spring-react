import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type MockedFunction } from 'vitest';
import { LeaveRequestForm } from './LeaveRequestForm';
import { leaveApi } from '../api';

vi.mock('../api', () => {
    const createLeaveRequest = vi.fn();
    const getLeaveTypes = vi.fn();
    return { leaveApi: { createLeaveRequest, getLeaveTypes } };
});

const renderForm = async () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });

    (leaveApi.getLeaveTypes as MockedFunction<typeof leaveApi.getLeaveTypes>).mockResolvedValue([
        { id: 1, nom: 'Congé payé', code: 'CP', joursParAn: 25, compteWeekend: false, peutDeborderSurCP: false },
        { id: 2, nom: 'Mission', code: 'TRAVEL', joursParAn: 0, compteWeekend: true, peutDeborderSurCP: false }
    ]);

    const user = userEvent.setup();
    const utils = render(
        <QueryClientProvider client={queryClient}>
            <LeaveRequestForm onSuccess={vi.fn()} />
        </QueryClientProvider>
    );

    await waitFor(() => expect(leaveApi.getLeaveTypes).toHaveBeenCalled());
    return { user, ...utils };
};

describe('LeaveRequestForm - durée', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('affiche 0.5 jour pour une demi-journée', async () => {
        const { user } = await renderForm();

        await user.type(screen.getByLabelText('Date de début'), '2026-01-15');
        await user.type(screen.getByLabelText('Date de fin'), '2026-01-15');
        await user.selectOptions(screen.getByLabelText('Type de durée'), 'DEMI_JOUR_MATIN');

        await waitFor(() => {
            expect(screen.getByText(/0.5/)).toBeInTheDocument();
        });
    });

    it('rend les heures obligatoires en mode par heures', async () => {
        const { user } = await renderForm();

        await user.selectOptions(screen.getByLabelText('Type de durée'), 'PAR_HEURE');
        expect(screen.getByLabelText('Heure de début')).toBeInTheDocument();
        expect(screen.getByLabelText('Heure de fin')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /envoyer la demande/i }));

        const errors = await screen.findAllByText('Obligatoire pour le mode par heures');
        expect(errors).toHaveLength(2);
    });

    it('envoie les heures et le type de durée dans le payload', async () => {
        const { user } = await renderForm();

        (leaveApi.createLeaveRequest as MockedFunction<typeof leaveApi.createLeaveRequest>).mockResolvedValue({
            id: 1,
            dateDebut: '2026-02-10',
            dateFin: '2026-02-10',
            type: 'TRAVEL',
            statut: 'EN_ATTENTE',
            nombreJours: 0,
            motif: '',
            employeId: 1,
            employeNom: 'Test User',
            employeEmail: 'test@example.com',
            dateDemande: '2026-02-01'
        });

        await user.type(screen.getByLabelText('Date de début'), '2026-02-10');
        await user.type(screen.getByLabelText('Date de fin'), '2026-02-10');
        await user.selectOptions(screen.getByLabelText('Type de congé'), 'TRAVEL');
        await user.selectOptions(screen.getByLabelText('Type de durée'), 'PAR_HEURE');
        await user.type(screen.getByLabelText('Heure de début'), '09:00');
        await user.type(screen.getByLabelText('Heure de fin'), '12:00');

        await user.click(screen.getByRole('button', { name: /envoyer la demande/i }));

        await waitFor(() => {
            expect(leaveApi.createLeaveRequest).toHaveBeenCalledWith(
                {
                    dateDebut: '2026-02-10',
                    dateFin: '2026-02-10',
                    type: 'TRAVEL',
                    motif: '',
                    dureeType: 'PAR_HEURE',
                    heureDebut: '09:00',
                    heureFin: '12:00'
                },
                expect.anything()
            );
        });
    });
});
