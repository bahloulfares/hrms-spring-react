import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit2, Save, AlertCircle, Loader } from 'lucide-react';
import { getEmployee, updateEmployee } from '../api';
import type { Employee } from '../types';
import { Modal } from '../../../components/common/Modal';
import toast from 'react-hot-toast';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  employeeId: number | null;
  onClose: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  employeeId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee> | null>(null);

  const { data: employee, isLoading, isError, error } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => (employeeId ? getEmployee(employeeId) : null),
    enabled: isOpen && !!employeeId,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Employee>) =>
      updateEmployee(employeeId!, {
        email: data.email || '',
        motDePasse: '',
        nom: data.nom || '',
        prenom: data.prenom || '',
        telephone: data.telephone,
        poste: data.poste,
        departement: data.departement,
        roles: data.roles,
        actif: data.actif,
      }),
    onSuccess: (updatedEmployee) => {
      queryClient.setQueryData(['employee', employeeId], updatedEmployee);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé mis à jour avec succès');
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
    if (employee && isEditMode) {
      setEditData(employee);
    }
  }, [employee, isEditMode]);

  const handleEditToggle = () => {
    if (isEditMode) {
      setEditData(null);
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
      if (employee) setEditData(employee);
    }
  };

  const handleInputChange = (field: keyof Employee, value: any) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!editData) return;
    await updateMutation.mutateAsync(editData);
  };

  const displayData = isEditMode && editData ? editData : employee;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'Employé">
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
                <h3 className="text-lg font-semibold">
                  {displayData.prenom} {displayData.nom}
                </h3>
                {displayData.poste && (
                  <p className="text-gray-600 text-sm mt-1">{displayData.poste}</p>
                )}
              </div>

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
            </div>

            <div className="grid grid-cols-1 gap-4">
              {isEditMode && editData ? (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom</label>
                  <input
                    type="text"
                    value={editData.nom || ''}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Nom de famille"
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
                  <label className="text-sm font-medium text-gray-600">Prénom</label>
                  <input
                    type="text"
                    value={editData.prenom || ''}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    placeholder="Prénom"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Prénom</label>
                  <p className="text-gray-900 mt-1">{displayData.prenom}</p>
                </div>
              )}

              {isEditMode && editData ? (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email professionnel"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 mt-1">{displayData.email}</p>
                </div>
              )}

              {isEditMode && editData ? (
                <div>
                  <label className="text-sm font-medium text-gray-600">Téléphone</label>
                  <input
                    type="tel"
                    value={editData.telephone || ''}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    placeholder="Numéro de téléphone"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Téléphone</label>
                  <p className="text-gray-900 mt-1">{displayData.telephone || '-'}</p>
                </div>
              )}

              {isEditMode && editData ? (
                <div>
                  <label className="text-sm font-medium text-gray-600">Poste</label>
                  <input
                    type="text"
                    value={editData.poste || ''}
                    onChange={(e) => handleInputChange('poste', e.target.value)}
                    placeholder="Titre du poste"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Poste</label>
                  <p className="text-gray-900 mt-1">{displayData.poste || '-'}</p>
                </div>
              )}

              {isEditMode && editData ? (
                <div>
                  <label className="text-sm font-medium text-gray-600">Département</label>
                  <input
                    type="text"
                    value={editData.departement || ''}
                    onChange={(e) => handleInputChange('departement', e.target.value)}
                    placeholder="Département"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600">Département</label>
                  <p className="text-gray-900 mt-1">{displayData.departement || '-'}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Statut</label>
                <p className="text-gray-900 mt-1">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      displayData.actif
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {displayData.actif ? 'Actif' : 'Inactif'}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Date de création</label>
                <p className="text-gray-900 mt-1">
                  {displayData.dateCreation
                    ? new Date(displayData.dateCreation).toLocaleDateString('fr-FR')
                    : '-'}
                </p>
              </div>
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
