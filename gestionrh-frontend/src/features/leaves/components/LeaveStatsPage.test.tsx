import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type MockedFunction } from 'vitest';
import { LeaveStatsPage } from './LeaveStatsPage';
import { leaveApi } from '../api';
import { getDepartements } from '../../departments/api';

vi.mock('../api', () => {
    const getStatistics = vi.fn();
    const exportCsv = vi.fn();
    const getLeaveTypes = vi.fn();
    return { leaveApi: { getStatistics, exportCsv, getLeaveTypes } };
});

vi.mock('../../departments/api', () => ({
    getDepartements: vi.fn(),
}));

const renderPage = async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    (leaveApi.getLeaveTypes as MockedFunction<typeof leaveApi.getLeaveTypes>).mockResolvedValue([
        { id: 1, nom: 'CP', code: 'CP', joursParAn: 25, compteWeekend: false, peutDeborderSurCP: false },
    ]);

    (getDepartements as MockedFunction<typeof getDepartements>).mockResolvedValue([
        { id: 10, nom: 'Tech' },
    ]);

    (leaveApi.getStatistics as MockedFunction<typeof leaveApi.getStatistics>).mockResolvedValue({
        totalDemandes: 5,
        demandesEnAttente: 2,
        demandesApprouvees: 2,
        demandesRejetees: 1,
        demandesAnnulees: 0,
        totalJoursConsommes: 8.5,
        parType: { CP: 3, RTT: 2 },
        parStatut: { EN_ATTENTE: 2, APPROUVE: 2, REJETE: 1 },
        joursParType: { CP: 5, RTT: 3.5 }
    });

    const user = userEvent.setup();

    const utils = render(
        <QueryClientProvider client={queryClient}>
            <LeaveStatsPage />
        </QueryClientProvider>
    );

    await waitFor(() => expect(leaveApi.getStatistics).toHaveBeenCalled());

    return { user, ...utils };
};

describe('LeaveStatsPage', () => {
    beforeEach(() => vi.clearAllMocks());

    it('affiche les KPI et charts après chargement', async () => {
        await renderPage();

        expect(await screen.findByText('Total demandes')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('8.5')).toBeInTheDocument();

        // Vérifie la présence des axes/labels graphiques
        expect(screen.getByText('Répartition par statut')).toBeInTheDocument();
        expect(screen.getByText('Répartition par type')).toBeInTheDocument();
    });

    it('permet de filtrer et déclenche un nouvel appel stats', async () => {
        const { user } = await renderPage();

        // Attendre que l'option soit chargée avant de sélectionner
        await screen.findByRole('option', { name: 'CP' });

        await user.selectOptions(screen.getByLabelText('Type de congé'), 'CP');
        await user.selectOptions(screen.getByLabelText('Statut'), 'EN_ATTENTE');
        await user.selectOptions(screen.getByLabelText('Département'), '10');
        await user.click(screen.getByRole('button', { name: /actualiser/i }));

        await waitFor(() => {
            expect(leaveApi.getStatistics).toHaveBeenCalledTimes(2);
            expect(leaveApi.getStatistics).toHaveBeenLastCalledWith({
                dateDebut: expect.any(String),
                dateFin: expect.any(String),
                typeConge: 'CP',
                statut: 'EN_ATTENTE',
                departementId: 10,
            });
        });
    });

    it('déclenche export CSV', async () => {
        const { user } = await renderPage();
        (leaveApi.exportCsv as MockedFunction<typeof leaveApi.exportCsv>).mockResolvedValue(new Blob(['csv']));

        await user.click(screen.getByRole('button', { name: /exporter csv/i }));

        await waitFor(() => {
            expect(leaveApi.exportCsv).toHaveBeenCalled();
        });
    });
});
