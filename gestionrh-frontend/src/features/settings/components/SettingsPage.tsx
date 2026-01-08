import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { settingsApi } from '../api';
import type { NotificationPreferences, TestNotificationRequest } from '../types';
import { Button } from '../../../components/ui/Button/Button';
import { Bell, Mail, MessageSquare, Smartphone, Send, Settings as SettingsIcon } from 'lucide-react';

const SettingsPage = () => {
    const queryClient = useQueryClient();
    const [testChannel, setTestChannel] = useState<'EMAIL' | 'SLACK' | 'SMS'>('EMAIL');

    const { data: preferences, isLoading } = useQuery({
        queryKey: ['notification-preferences'],
        queryFn: settingsApi.getPreferences,
    });

    const { register, handleSubmit, watch } = useForm<NotificationPreferences>({
        values: preferences || {
            emailEnabled: true,
            slackEnabled: false,
            smsEnabled: false,
            notificationTypes: [],
        },
    });

    const updateMutation = useMutation({
        mutationFn: settingsApi.updatePreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
            toast.success('Préférences sauvegardées avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de la sauvegarde des préférences');
        },
    });

    const testMutation = useMutation({
        mutationFn: settingsApi.testNotification,
        onSuccess: () => {
            toast.success(`Notification de test envoyée par ${testChannel}`);
        },
        onError: () => {
            toast.error('Erreur lors de l\'envoi de la notification de test');
        },
    });

    const onSubmit = handleSubmit((data) => {
        updateMutation.mutate(data);
    });

    const handleTestNotification = () => {
        const request: TestNotificationRequest = {
            channel: testChannel,
            message: 'Ceci est une notification de test depuis GestionRH',
        };
        testMutation.mutate(request);
    };

    const emailEnabled = watch('emailEnabled');
    const slackEnabled = watch('slackEnabled');
    const smsEnabled = watch('smsEnabled');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-slate-700" aria-hidden="true" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Paramètres</h1>
                    <p className="text-sm text-slate-500">Gérez vos préférences de notification et d'affichage</p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6" aria-label="Formulaire de paramètres">
                {/* Section Notifications */}
                <motion.fieldset
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >
                    <legend className="sr-only">Préférences de notification</legend>
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-blue-600" aria-hidden="true" />
                        <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
                    </div>

                    <p className="text-sm text-slate-600 mb-6">
                        Choisissez les canaux par lesquels vous souhaitez recevoir les notifications
                    </p>

                    <div className="space-y-4" role="group" aria-labelledby="notification-channels">
                        {/* Email Toggle */}
                        <ToggleCard
                            icon={<Mail className="w-5 h-5" />}
                            title="Email"
                            description="Recevez des notifications par email"
                            enabled={emailEnabled}
                            register={register('emailEnabled')}
                        />

                        {/* Slack Toggle */}
                        <ToggleCard
                            icon={<MessageSquare className="w-5 h-5" />}
                            title="Slack"
                            description="Recevez des notifications sur Slack"
                            enabled={slackEnabled}
                            register={register('slackEnabled')}
                        />

                        {/* SMS Toggle */}
                        <ToggleCard
                            icon={<Smartphone className="w-5 h-5" />}
                            title="SMS"
                            description="Recevez des notifications par SMS"
                            enabled={smsEnabled}
                            register={register('smsEnabled')}
                        />
                    </div>
                </motion.fieldset>

                {/* Section Test Notifications */}
                <motion.fieldset
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >
                    <legend className="sr-only">Test de notification</legend>
                    <div className="flex items-center gap-2 mb-4">
                        <Send className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                        <h2 className="text-lg font-semibold text-slate-800">Test de notification</h2>
                    </div>

                    <p className="text-sm text-slate-600 mb-4">
                        Envoyez une notification de test pour vérifier votre configuration
                    </p>

                    <div className="flex items-center gap-3">
                        <label htmlFor="test-channel" className="text-sm font-medium text-slate-700">
                            Canal:
                        </label>
                        <select
                            id="test-channel"
                            value={testChannel}
                            onChange={(e) => setTestChannel(e.target.value as 'EMAIL' | 'SLACK' | 'SMS')}
                            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Sélectionner le canal pour le test"
                        >
                            <option value="EMAIL">Email</option>
                            <option value="SLACK">Slack</option>
                            <option value="SMS">SMS</option>
                        </select>

                        <Button
                            type="button"
                            variant="secondary"
                            leftIcon={<Send className="w-4 h-4" />}
                            onClick={handleTestNotification}
                            disabled={testMutation.isPending}
                            loading={testMutation.isPending}
                            title={`Envoyer une notification de test par ${testChannel}`}
                        >
                            Envoyer test
                        </Button>
                    </div>
                </motion.fieldset>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="flex justify-end"
                >
                    <Button
                        type="submit"
                        variant="primary"
                        loading={updateMutation.isPending}
                        disabled={updateMutation.isPending}
                    >
                        Enregistrer les modifications
                    </Button>
                </motion.div>
            </form>
        </motion.div>
    );
};

interface ToggleCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    enabled: boolean;
    register: any;
}

const ToggleCard = ({ icon, title, description, enabled, register }: ToggleCardProps) => (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                {icon}
            </div>
            <div>
                <p className="font-medium text-slate-800">{title}</p>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...register} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
);

export default SettingsPage;
