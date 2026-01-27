import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit2, Save, AlertCircle, Loader } from 'lucide-react';
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
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setIsEditMode(false);
      setEditData(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (department && isEditMode) setEditData(department);
  }, [department, isEditMode]);

  const handleEditToggle = () => {
    if (isEditMode) {
      setEditData(null);
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
      if (department) setEditData(department);
    }
  };

  const handleInputChange = (field: keyof Departement, value: any) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!editData) return;
    await updateMutation.mutateAsync(editData);
  };

  const displayData = isEditMode && editData ? editData : department;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du Département">
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
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{displayData.nom}</h3>
                {displayData.managerNom && (
                  <p className="text-gray-600 text-sm mt-1">
                    Manager: {displayData.managerNom}
                  </p>
                )}
              </div>

              {canEdit && (
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isEditMode
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
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

            <div className="grid grid-cols-1 gap-4">
              {isEditMode && editData ? (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom</label>
                  <input
                    type="text"
                    value={editData.nom || ''}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Nom du département"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom</label>
                  <p className="text-gray-900 mt-1">{displayData.nom}</p>
                </div>
              )}

              {isEditMode && editData ? (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description du département"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-1"
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1">{displayData.description || '-'}</p>
                </div>
              )}

              {isEditMode && editData ? (
                <div>
                  <label className="text-sm font-medium text-gray-600">Manager ID</label>
                  <input
                    type="number"
                    value={editData.managerId?.toString() || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'managerId',
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                    placeholder="ID du manager"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Manager</label>
                  <p className="text-gray-900 mt-1">{displayData.managerNom || '-'}</p>
                </div>
              )}
            </div>

            {isEditMode && (
              <div className="flex gap-3 pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer
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
