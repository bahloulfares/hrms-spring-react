import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit2, Save, AlertCircle, Loader, Briefcase, Building2, FileText, DollarSign, Calendar } from 'lucide-react';
import { getPoste, updatePoste } from '../api';
import type { Poste } from '../types';
import { Modal } from '../../../components/common/Modal';
import toast from 'react-hot-toast';

interface JobDetailModalProps {
  isOpen: boolean;
  jobId: number | null;
  onClose: () => void;
  isReadOnly?: boolean; // Mode consultation (Eye icon)
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  isOpen,
  jobId,
  onClose,
  isReadOnly = true, // Par défaut, consultation
}) => {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Poste> | null>(null);

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['poste', jobId],
    queryFn: () => (jobId ? getPoste(jobId) : null),
    enabled: isOpen && !!jobId,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Poste>) =>
      updatePoste(jobId!, {
        titre: data.titre || '',
        description: data.description,
        salaireMin: data.salaireMin,
        salaireMax: data.salaireMax,
        departementId: data.departementId || 0,
      }),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(['poste', jobId], updatedJob);
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      toast.success('Poste mis à jour avec succès');
      setIsEditMode(false);
      setEditData(null);
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError?.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  const handleClose = () => {
    setIsEditMode(false);
    setEditData(null);
    onClose();
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      setEditData(null);
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
      if (job) setEditData(job);
    }
  };

  const handleInputChange = (field: keyof Poste, value: string | number | null) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!editData) return;
    await updateMutation.mutateAsync(editData);
  };

  const displayData = isEditMode && editData ? editData : job;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Détails du Poste">
      <div className="space-y-6">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-500" data-testid="loading-spinner" />
          </div>
        )}

        {isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Erreur de chargement</p>
              <p className="text-red-800 text-sm mt-1">
                {error instanceof Error ? error.message : 'Veuillez réessayer'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && displayData && (
          <>
            {/* En-tête avec titre et badge */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{displayData.titre}</h3>
                  {displayData.departementNom && (
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Département: </span>
                      <span className="text-sm font-medium text-purple-600">{displayData.departementNom}</span>
                    </div>
                  )}
                </div>
              </div>

              {!isReadOnly && (
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                    isEditMode
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
                  }`}
                >
                  {isEditMode ? (
                    <>
                      <X className="w-4 h-4" />
                      Annuler
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Carte d'informations principales */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 space-y-5">
              {/* Titre du poste */}
              {isEditMode && editData ? (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4" />
                    Titre du poste
                  </label>
                  <input
                    type="text"
                    value={editData.titre || ''}
                    onChange={(e) => handleInputChange('titre', e.target.value)}
                    placeholder="Titre du poste"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-sm"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    Titre du poste
                  </label>
                  <p className="text-gray-900 font-medium text-lg">{displayData.titre}</p>
                </div>
              )}

              {/* Description */}
              {isEditMode && editData ? (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description du poste"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-sm resize-none"
                    rows={4}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    Description
                  </label>
                  <p className="text-gray-700 leading-relaxed">{displayData.description || <span className="text-gray-400 italic">Aucune description</span>}</p>
                </div>
              )}

              {/* Fourchette de salaire */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Salaire minimum */}
                {isEditMode && editData ? (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Salaire Minimum
                    </label>
                    <input
                      type="number"
                      value={editData.salaireMin?.toString() || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'salaireMin',
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      placeholder="Salaire minimum"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      Salaire Minimum
                    </label>
                    <p className="text-gray-900 font-semibold text-lg">
                      {displayData.salaireMin !== undefined
                        ? <><span className="text-green-600">{displayData.salaireMin.toLocaleString('fr-FR')}</span> <span className="text-sm text-gray-500">DT</span></>
                        : <span className="text-gray-400 italic text-base">Non défini</span>}
                    </p>
                  </div>
                )}

                {/* Salaire maximum */}
                {isEditMode && editData ? (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Salaire Maximum
                    </label>
                    <input
                      type="number"
                      value={editData.salaireMax?.toString() || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'salaireMax',
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      placeholder="Salaire maximum"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      Salaire Maximum
                    </label>
                    <p className="text-gray-900 font-semibold text-lg">
                      {displayData.salaireMax !== undefined
                        ? <><span className="text-green-600">{displayData.salaireMax.toLocaleString('fr-FR')}</span> <span className="text-sm text-gray-500">DT</span></>
                        : <span className="text-gray-400 italic text-base">Non défini</span>}
                    </p>
                  </div>
                )}
              </div>

              {/* Département */}
              {isEditMode && editData ? (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-4 h-4" />
                    Département ID
                  </label>
                  <input
                    type="number"
                    value={editData.departementId?.toString() || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'departementId',
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    placeholder="ID du département"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-sm"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Département
                  </label>
                  <p className="text-gray-900 font-medium">{displayData.departementNom || <span className="text-gray-400 italic">Non assigné</span>}</p>
                </div>
              )}

              {/* Date de création - Affichage uniquement en mode lecture */}
              {!isEditMode && displayData.createdAt && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Date de création
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(displayData.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Bouton d'enregistrement en mode édition */}
            {isEditMode && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-purple-200"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
