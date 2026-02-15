import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit2, Save, AlertCircle, Loader, Building2, User, FileText, Calendar } from 'lucide-react';
import { getDepartement, updateDepartement } from '../api';
import type { Departement } from '../types';
import { Modal } from '../../../components/common/Modal';
import { useAuthStore } from '../../../store/auth';
import toast from 'react-hot-toast';

interface DepartmentDetailModalProps {
  isOpen: boolean;
  departmentId: number | null;
  onClose: () => void;
  isReadOnly?: boolean; // Mode consultation (Eye icon)
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  isOpen,
  departmentId,
  onClose,
  isReadOnly = true, // Par défaut, consultation
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Departement> | null>(null);

  // ✅ Vérifier si l'utilisateur peut modifier (ADMIN ou RH)
  const canEdit = !isReadOnly && (user?.roles?.includes('ADMIN') || user?.roles?.includes('RH'));

  const { data: department, isLoading, isError, error } = useQuery({
    queryKey: ['departement', departmentId],
    queryFn: () => (departmentId ? getDepartement(departmentId) : null),
    enabled: isOpen && !!departmentId,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Departement>) =>
      updateDepartement(departmentId!, {
        nom: data.nom || '',
        description: data.description,
        managerId: data.managerId,
      }),
    onSuccess: (updatedDept) => {
      queryClient.setQueryData(['departement', departmentId], updatedDept);
      queryClient.invalidateQueries({ queryKey: ['departements'] });
      toast.success('Département mis à jour avec succès');
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
      if (department) setEditData(department);
    }
  };

  const handleInputChange = (field: keyof Departement, value: string | number | null) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!editData) return;
    await updateMutation.mutateAsync(editData);
  };

  const displayData = isEditMode && editData ? editData : department;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Détails du Département">
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
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{displayData.nom}</h3>
                  {displayData.managerNom && (
                    <div className="flex items-center gap-2 mt-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Manager: </span>
                      <span className="text-sm font-medium text-blue-600">{displayData.managerNom}</span>
                    </div>
                  )}
                </div>
              </div>

              {canEdit && (
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                    isEditMode
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
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
              {/* Nom du département */}
              {isEditMode && editData ? (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-4 h-4" />
                    Nom du département
                  </label>
                  <input
                    type="text"
                    value={editData.nom || ''}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Nom du département"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Nom du département
                  </label>
                  <p className="text-gray-900 font-medium text-lg">{displayData.nom}</p>
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
                    placeholder="Description du département"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm resize-none"
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

              {/* Manager */}
              {isEditMode && editData ? (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Manager ID
                  </label>
                  <input
                    type="number"
                    value={editData.managerId?.toString() || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'managerId',
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    placeholder="ID du manager"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    <User className="w-3.5 h-3.5" />
                    Manager
                  </label>
                  <p className="text-gray-900 font-medium">{displayData.managerNom || <span className="text-gray-400 italic">Non assigné</span>}</p>
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-200"
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
