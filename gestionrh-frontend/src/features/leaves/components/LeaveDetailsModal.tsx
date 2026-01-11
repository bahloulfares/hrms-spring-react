import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../../components/common/Modal';
import { leaveApi } from '../api';
import type { CongeHistorique } from '../api';
import type { Conge, SoldeConge } from '../types';
import { useAuthStore } from '../../../store/auth';
import { CheckCircle2, XCircle, Clock, Loader } from 'lucide-react';

interface LeaveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveId: number;
}

export const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({ isOpen, onClose, leaveId }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'balance'>('info');
  const user = useAuthStore((s) => s.user);
  const roles = user?.roles || [];
  const canSeeBalance = roles.includes('MANAGER') || roles.includes('RH') || roles.includes('ADMIN');

  const { data: leave, isLoading: loadingLeave } = useQuery<Conge>({
    queryKey: ['leave-details', leaveId],
    queryFn: () => leaveApi.getLeaveDetails(leaveId),
    enabled: isOpen,
  });

  const { data: history, isLoading: loadingHistory } = useQuery<CongeHistorique[]>({
    queryKey: ['leave-history', leaveId],
    queryFn: () => leaveApi.getLeaveHistory(leaveId),
    enabled: isOpen && activeTab === 'history',
  });

  const { data: balances, isLoading: loadingBalances } = useQuery<SoldeConge[]>({
    queryKey: ['employee-balances', leaveId],
    queryFn: () => leave && leave.employeId != null ? leaveApi.getEmployeeBalances(leave.employeId) : Promise.resolve([]),
    enabled: isOpen && activeTab === 'balance' && !!leave && leave?.employeId != null && canSeeBalance,
  });

  const getStatusIcon = (status?: string | null) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROUVE':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'REJETE':
      case 'REFUSE':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'ANNULE':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de la Demande">
      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex gap-2">
          <button
            className={`px-3 py-2 text-sm font-medium rounded-t ${activeTab === 'info' ? 'bg-white border border-b-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('info')}
          >
            📝 Informations
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-t ${activeTab === 'history' ? 'bg-white border border-b-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('history')}
          >
            📜 Historique
          </button>
          {canSeeBalance && (
            <button
              className={`px-3 py-2 text-sm font-medium rounded-t ${activeTab === 'balance' ? 'bg-white border border-b-white' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('balance')}
            >
              📊 Solde
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[260px]">
        {activeTab === 'info' && (
          loadingLeave ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 animate-spin text-blue-500 mr-2" />
              Chargement des détails...
            </div>
          ) : leave ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(leave.statut)}
                <span className="font-semibold">{leave.statut}</span>
              </div>
              <div className="text-sm text-gray-700">
                <div><span className="font-medium">Employé:</span> {leave.employeNom} ({leave.employeEmail})</div>
                <div><span className="font-medium">Type:</span> {leave.type}</div>
                <div><span className="font-medium">Durée:</span> {leave.nombreJours} jours</div>
                <div><span className="font-medium">Dates:</span> du {new Date(leave.dateDebut).toLocaleDateString()} au {new Date(leave.dateFin).toLocaleDateString()}</div>
                {leave.validateurNom && (
                  <div><span className="font-medium">Validé par:</span> {leave.validateurNom}</div>
                )}
                {leave.commentaireValidation && (
                  <div className="mt-2 p-3 bg-gray-50 rounded"><span className="font-medium">Commentaire:</span> {leave.commentaireValidation}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">Aucun détail disponible</div>
          )
        )}

        {activeTab === 'history' && (
          loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 animate-spin text-blue-500 mr-2" />
              Chargement de l'historique...
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(entry.statutNouveau)}
                    {index < history.length - 1 && (
                      <div className="w-0.5 h-10 bg-gray-300 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-semibold">
                      {(entry.statutNouveau || '').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{entry.acteurNom}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(entry.dateModification).toLocaleString('fr-FR')}</span>
                    </div>
                    {entry.commentaire && (
                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Commentaire:</span> {entry.commentaire}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">Pas d'historique disponible</div>
          )
        )}

        {activeTab === 'balance' && canSeeBalance && (
          loadingBalances ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 animate-spin text-blue-500 mr-2" />
              Chargement des soldes...
            </div>
          ) : balances && balances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {balances.map((solde) => {
                const total = solde.joursParAn || 0;
                const utilises = total - solde.joursRestants;
                const pct = total > 0 ? (utilises / total) * 100 : 0;
                return (
                  <div key={solde.id} className="p-4 border rounded-lg">
                    <div className="font-medium text-gray-700">{solde.typeCongeNom} ({solde.annee})</div>
                    <div className="text-sm text-gray-600">{solde.joursRestants}/{total} jours restants</div>
                    <div className="mt-2 w-full bg-gray-200 h-2 rounded">
                      <div
                        className={`h-2 rounded ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">Aucun solde disponible pour cet employé</div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 border-t pt-4 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded hover:bg-gray-100">Fermer</button>
      </div>
    </Modal>
  );
};

export default LeaveDetailsModal;
