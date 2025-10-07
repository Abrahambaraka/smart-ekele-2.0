import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';


const EditUserModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    status: 'active',
    classAssignments: [],
    permissions: [],
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'administrator', label: 'Administrateur' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'student', label: 'Étudiant' },
    { value: 'parent', label: 'Parent' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'pending', label: 'En attente' }
  ];

  const classOptions = [
    { value: 'class-1', label: 'Classe de CP' },
    { value: 'class-2', label: 'Classe de CE1' },
    { value: 'class-3', label: 'Classe de CE2' },
    { value: 'class-4', label: 'Classe de CM1' },
    { value: 'class-5', label: 'Classe de CM2' }
  ];

  const permissionOptions = [
    { value: 'user-management', label: 'Gestion des utilisateurs' },
    { value: 'class-management', label: 'Gestion des classes' },
    { value: 'student-management', label: 'Gestion des étudiants' },
    { value: 'payment-management', label: 'Gestion financière' },
    { value: 'reports', label: 'Accès aux rapports' },
    { value: 'notifications', label: 'Envoi de notifications' }
  ];

  useEffect(() => {
    if (user && isOpen) {
      const nameParts = user?.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastNameParts = nameParts.slice(1);
      setFormData({
        firstName: firstName,
        lastName: lastNameParts?.join(' ') || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || '',
        status: user?.status || 'active',
        classAssignments: user?.classAssignments || [],
        permissions: user?.permissions || [],
        isActive: user?.status === 'active'
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.firstName?.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData?.email?.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/?.test(formData?.email)) newErrors.email = 'Email invalide';
    if (!formData?.role) newErrors.role = 'Le rôle est requis';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updatedUser = {
        ...user,
        name: `${formData?.firstName} ${formData?.lastName}`,
        email: formData?.email,
        phone: formData?.phone,
        role: formData?.role,
        status: formData?.status,
        classAssignments: formData?.classAssignments,
        permissions: formData?.permissions
      };
      await onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Edit" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Modifier l'utilisateur</h2>
              <p className="text-sm text-muted-foreground">Mettre à jour les informations de {user?.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={onClose}
            className="h-8 w-8"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                type="text"
                required
                value={formData?.firstName}
                onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                error={errors?.firstName}
                placeholder="Entrez le prénom"
              />
              <Input
                label="Nom"
                type="text"
                required
                value={formData?.lastName}
                onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                error={errors?.lastName}
                placeholder="Entrez le nom"
              />
              <Input
                label="Email"
                type="email"
                required
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                placeholder="exemple@smartekele.fr"
              />
              <Input
                label="Téléphone"
                type="tel"
                value={formData?.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>

          {/* Role and Status */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Rôle et statut</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Rôle"
                required
                options={roleOptions}
                value={formData?.role}
                onChange={(value) => handleInputChange('role', value)}
                error={errors?.role}
              />
              <Select
                label="Statut"
                options={statusOptions}
                value={formData?.status}
                onChange={(value) => handleInputChange('status', value)}
              />
            </div>
          </div>

          {/* Class Assignments (for teachers) */}
          {formData?.role === 'teacher' && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Assignation de classes</h3>
              <Select
                label="Classes assignées"
                multiple
                searchable
                options={classOptions}
                value={formData?.classAssignments}
                onChange={(value) => handleInputChange('classAssignments', value)}
                description="Sélectionnez les classes pour cet enseignant"
              />
            </div>
          )}

          {/* Permissions (for administrators) */}
          {formData?.role === 'administrator' && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Permissions</h3>
              <Select
                label="Permissions accordées"
                multiple
                searchable
                options={permissionOptions}
                value={formData?.permissions}
                onChange={(value) => handleInputChange('permissions', value)}
                description="Définir les accès pour cet administrateur"
              />
            </div>
          )}

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Informations du compte</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID utilisateur:</span>
                  <span className="ml-2 font-mono text-foreground">{user?.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Créé le:</span>
                  <span className="ml-2 text-foreground">{user?.createdAt || '15/09/2025'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Dernière connexion:</span>
                  <span className="ml-2 text-foreground">
                    {user?.lastLogin ? new Date(user.lastLogin)?.toLocaleDateString('fr-FR') : 'Jamais'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Dernière modification:</span>
                  <span className="ml-2 text-foreground">Aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                iconName="Key"
                iconPosition="left"
                onClick={() => console.log('Reset password for', user?.id)}
              >
                Réinitialiser le mot de passe
              </Button>
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                iconName="Save"
                iconPosition="left"
              >
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;