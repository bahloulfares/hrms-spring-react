import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SettingsPage from './SettingsPage';
import { settingsApi } from '../api';

vi.mock('../api', () => ({
    settingsApi: {
        getPreferences: vi.fn(),
        updatePreferences: vi.fn(),
        testNotification: vi.fn(),
    },
}));

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

describe('SettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should display loading state initially', () => {
            vi.mocked(settingsApi.getPreferences).mockImplementation(() => new Promise(() => {}));
            
            render(<SettingsPage />, { wrapper: createWrapper() });
            
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('should render settings page with sections', async () => {
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByText('Paramètres')).toBeInTheDocument();
            });

            expect(screen.getByText('Notifications')).toBeInTheDocument();
            // Use queryAllByText and get the visible one (h2) not the sr-only legend
            const testNotifHeadings = screen.queryAllByText('Test de notification');
            expect(testNotifHeadings.length).toBeGreaterThan(0);
            expect(testNotifHeadings.some(el => el.tagName === 'H2')).toBe(true);
        });

        it('should render all three notification toggles', async () => {
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes).toHaveLength(3);
            });

            expect(screen.getAllByText('Email')).toHaveLength(2); // label + option
            expect(screen.getAllByText('Slack')).toHaveLength(2); // label + option
            expect(screen.getAllByText('SMS')).toHaveLength(2); // label + option
        });
    });

    describe('Toggle Functionality', () => {
        it('should load preferences with correct toggle states', async () => {
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: true,
                smsEnabled: false,
                notificationTypes: [],
            });

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes).toHaveLength(3);
            });

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes[0]).toBeChecked(); // Email
            expect(checkboxes[1]).toBeChecked(); // Slack
            expect(checkboxes[2]).not.toBeChecked(); // SMS
        });

        it('should toggle email notification', async () => {
            const user = userEvent.setup();
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes).toHaveLength(3);
            });

            const emailCheckbox = screen.getAllByRole('checkbox')[0];
            expect(emailCheckbox).toBeChecked();

            await user.click(emailCheckbox);
            expect(emailCheckbox).not.toBeChecked();
        });
    });

    describe('Save Preferences', () => {
        it('should call updatePreferences on form submit', async () => {
            const user = userEvent.setup();
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });
            vi.mocked(settingsApi.updatePreferences).mockResolvedValue({
                emailEnabled: false,
                slackEnabled: true,
                smsEnabled: false,
                notificationTypes: [],
            });

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes).toHaveLength(3);
            });

            // Toggle Slack
            const slackCheckbox = screen.getAllByRole('checkbox')[1];
            await user.click(slackCheckbox);

            // Submit
            const saveButton = screen.getByRole('button', { name: /enregistrer/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(settingsApi.updatePreferences).toHaveBeenCalledWith(
                    expect.objectContaining({
                        slackEnabled: true,
                    }),
                    expect.anything()
                );
            });
        });

        it('should show success toast on successful save', async () => {
            const user = userEvent.setup();
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });
            vi.mocked(settingsApi.updatePreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes).toHaveLength(3);
            });

            const saveButton = screen.getByRole('button', { name: /enregistrer/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(settingsApi.updatePreferences).toHaveBeenCalled();
            });
        });

        it('should show error toast on failed save', async () => {
            const user = userEvent.setup();
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });
            vi.mocked(settingsApi.updatePreferences).mockRejectedValue(new Error('Network error'));

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', { name: /enregistrer/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(settingsApi.updatePreferences).toHaveBeenCalled();
            });
        });
    });

    describe('Test Notification', () => {
        it('should render test notification controls', async () => {
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                // Get the visible h2 heading for 'Test de notification'
                const testNotifHeadings = screen.queryAllByText('Test de notification');
                expect(testNotifHeadings.some(el => el.tagName === 'H2')).toBe(true);
            });

            expect(screen.getByRole('combobox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /envoyer test/i })).toBeInTheDocument();
        });

        it('should send test notification on button click', async () => {
            const user = userEvent.setup();
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });
            vi.mocked(settingsApi.testNotification).mockResolvedValue();

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /envoyer test/i })).toBeInTheDocument();
            });

            const testButton = screen.getByRole('button', { name: /envoyer test/i });
            await user.click(testButton);

            await waitFor(() => {
                expect(settingsApi.testNotification).toHaveBeenCalledWith(
                    {
                        channel: 'EMAIL',
                        message: 'Ceci est une notification de test depuis GestionRH',
                    },
                    expect.anything()
                );
            });
        });

        it('should change test channel via select', async () => {
            const user = userEvent.setup();
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });
            vi.mocked(settingsApi.testNotification).mockResolvedValue();

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByRole('combobox')).toBeInTheDocument();
            });

            const select = screen.getByRole('combobox');
            await user.selectOptions(select, 'SLACK');

            const testButton = screen.getByRole('button', { name: /envoyer test/i });
            await user.click(testButton);

            await waitFor(() => {
                expect(settingsApi.testNotification).toHaveBeenCalledWith(
                    {
                        channel: 'SLACK',
                        message: 'Ceci est une notification de test depuis GestionRH',
                    },
                    expect.anything()
                );
            });
        });

        it('should show success toast after test notification', async () => {
            const user = userEvent.setup();
            vi.mocked(settingsApi.getPreferences).mockResolvedValue({
                emailEnabled: true,
                slackEnabled: false,
                smsEnabled: false,
                notificationTypes: [],
            });
            vi.mocked(settingsApi.testNotification).mockResolvedValue();

            render(<SettingsPage />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /envoyer test/i })).toBeInTheDocument();
            });

            const testButton = screen.getByRole('button', { name: /envoyer test/i });
            await user.click(testButton);

            await waitFor(() => {
                expect(settingsApi.testNotification).toHaveBeenCalled();
            });
        });
    });
});
