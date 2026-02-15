import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit2, Save, AlertCircle, Loader } from 'lucide-react';
import { getEmployee, updateEmployee } from '../api';
import { getDepartements } from '../../departments/api';
import { getPostesByDepartement } from '../../jobs/api';
import type { Employee } from '../types';
import { Modal } from '../../../components/common/Modal';
import toast from 'react-hot-toast';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  employeeId: number | null;
  onClose: () => void;
  isReadOnly?: boolean; // Mode consultation (Eye icon)
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  employeeId,
  onClose,
  isReadOnly = true, // Par défaut, consultation
}) => {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee> | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const { data: employee, isLoading, isError, error } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => (employeeId ? getEmployee(employeeId) : null),
    enabled: isOpen && !!employeeId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: departements } = useQuery({
    queryKey: ['departements'],
    queryFn: getDepartements,
  });

  const selectedDeptId = departements?.find(d => d.nom === editData?.departement)?.id;

  const { data: filteredPostes } = useQuery({
    queryKey: ['postes', selectedDeptId],
    queryFn: () => getPostesByDepartement(selectedDeptId!),
    enabled: !!selectedDeptId && isEditMode
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Employee> & { newPassword?: string }) => {
      const payload: Record<string, unknown> = {
        email: data.email || '',
        nom: data.nom || '',
        prenom: data.prenom || '',
        telephone: data.telephone,
        poste: data.poste,
        departement: data.departement,
        roles: data.roles,
        actif: data.actif,
      };
      
      // Ajouter le mot de passe SEULEMENT s'il n'est pas vide
      if (data.newPassword && data.newPassword.trim() !== '') {
        payload.motDePasse = data.newPassword;
      }
      
      return updateEmployee(employeeId!, payload);
    },
    onSuccess: (updatedEmployee) => {
      queryClient.setQueryData(['employee', employeeId], updatedEmployee);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé mis à jour avec succès');
      setIsEditMode(false);
      setEditData(null);
      setNewPassword('');
      // Fermer le modal après succès de la mise à jour
      setTimeout(() => onClose(), 500);
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError?.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  const handleClose = () => {
    setIsEditMode(false);
    setNewPassword('');
    setEditData(null);
    onClose();
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      setNewPassword('');
      setEditData(null);
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
      if (employee) setEditData(employee);
    }
  };

  const handleInputChange = (field: keyof Employee, value: string | number | boolean | string[] | null) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!editData) return;
    await updateMutation.mutateAsync({ ...editData, newPassword });
  };

  const displayData = isEditMode && editData ? editData : employee;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="">
      <div className="space-y-4 max-h-[85vh] overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader className="w-8 h-8 animate-spin text-blue-600" data-testid="loading-spinner" />
          </div>
        )}

        {isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Erreur de chargement</p>
              <p className="text-red-800 text-sm mt-1">
                {error instanceof Error ? error.message : 'Veuillez réessayer'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && displayData && (
          <>
            {/* En-tête avec titre et bouton édition */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {displayData.prenom} {displayData.nom}
                </h2>
                {displayData.poste && (
                  <p className="text-gray-500 text-sm mt-1">📍 {displayData.poste}</p>
                )}
                {displayData.departement && (
                  <p className="text-gray-500 text-sm">🏢 {displayData.departement}</p>
                )}
              </div>

              {!isReadOnly && (
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isEditMode
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
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

            {/* Grille des informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nom */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                {isEditMode && editData ? (
                  <input
                    type="text"
                    value={editData.nom || ''}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Nom de famille"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-words overflow-hidden">{displayData.nom}</p>
                )}
              </div>

              {/* Prénom */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Prénom</label>
                {isEditMode && editData ? (
                  <input
                    type="text"
                    value={editData.prenom || ''}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    placeholder="Prénom"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-words overflow-hidden">{displayData.prenom}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                {isEditMode && editData ? (
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email professionnel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-words overflow-hidden">{displayData.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Téléphone</label>
                {isEditMode && editData ? (
                  <input
                    type="tel"
                    value={editData.telephone || ''}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    placeholder="Numéro de téléphone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-words overflow-hidden">{displayData.telephone || '-'}</p>
                )}
              </div>

              {/* Département */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Département</label>
                {isEditMode && editData ? (
                  <select
                    value={editData.departement || ''}
                    onChange={(e) => {
                      handleInputChange('departement', e.target.value);
                      handleInputChange('poste', '');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="">-- Sélectionner un département --</option>
                    {departements?.map(d => (
                      <option key={d.id} value={d.nom}>{d.nom}</option>
                    ))}
                  </select>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-words overflow-hidden">{displayData.departement || '-'}</p>
                )}
              </div>

              {/* Poste */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Poste</label>
                {isEditMode && editData ? (
                  <select
                    value={editData.poste || ''}
                    onChange={(e) => handleInputChange('poste', e.target.value)}
                    disabled={!editData.departement}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white appearance-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="">{editData.departement ? 'Sélectionner un poste' : 'Choisir d\'abord un département'}</option>
                    {filteredPostes?.map(p => (
                      <option key={p.id} value={p.titre}>{p.titre}</option>
                    ))}
                  </select>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-words overflow-hidden">{displayData.poste || '-'}</p>
                )}
              </div>

              {/* Nouveau mot de passe */}
              {isEditMode && (
                <div className="md:col-span-2 space-y-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="text-sm font-semibold text-gray-700">
                    Nouveau mot de passe <span className="text-gray-500 font-normal text-xs">(optionnel)</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Laisser vide pour ne pas modifier le mot de passe</p>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrer un nouveau mot de passe (8+ caractères)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  />
                  {newPassword && newPassword.length > 0 && newPassword.length < 8 && (
                    <p className="text-xs text-red-600 mt-2">⚠️ Le mot de passe doit contenir au moins 8 caractères</p>
                  )}
                  {newPassword && newPassword.length > 0 && newPassword.length >= 8 && (
                    <p className="text-xs text-green-600 mt-2">✓ Format valide</p>
                  )}
                </div>
              )}

              {/* Statut */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Statut</label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-words overflow-hidden">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      displayData.actif
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {displayData.actif ? '✓ Actif' : '✗ Inactif'}
                  </span>
                </p>
              </div>

              {/* Date de création */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Date de création</label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-words overflow-hidden">
                  {displayData.dateCreation
                    ? new Date(displayData.dateCreation).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '-'}
                </p>
              </div>
            </div>

            {isEditMode && (
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
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
                <button
                  onClick={() => setIsEditMode(false)}
                  disabled={updateMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Annuler
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
