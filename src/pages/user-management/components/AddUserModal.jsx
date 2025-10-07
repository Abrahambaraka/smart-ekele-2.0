import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AddUserModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    status: 'active',
    password: '',
    confirmPassword: '',
    sendWelcomeEmail: true,
    requirePasswordChange: true,
    classAssignments: [],
    permissions: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: '', label: 'Sélectionner un rôle...' },
    { value: 'administrator', label: 'Administrateur' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'student', label: 'Étudiant' },
    { value: 'parent', label: 'Parent' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
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
    if (!formData?.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData?.password?.length < 8) newErrors.password = 'Minimum 8 caractères';
    if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        status: 'active',
        password: '',
        confirmPassword: '',
        sendWelcomeEmail: true,
        requirePasswordChange: true,
        classAssignments: [],
        permissions: []
      });
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="UserPlus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Ajouter un utilisateur</h2>
              <p className="text-sm text-muted-foreground">Créer un nouveau compte utilisateur</p>
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

          {/* Password */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Mot de passe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Mot de passe"
                type="password"
                required
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                description="Minimum 8 caractères"
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                required
                value={formData?.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                error={errors?.confirmPassword}
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

          {/* Options */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Options</h3>
            <div className="space-y-3">
              <Checkbox
                label="Envoyer un email de bienvenue"
                description="L'utilisateur recevra ses identifiants par email"
                checked={formData?.sendWelcomeEmail}
                onChange={(e) => handleInputChange('sendWelcomeEmail', e?.target?.checked)}
              />
              <Checkbox
                label="Forcer le changement de mot de passe"
                description="L'utilisateur devra changer son mot de passe à la première connexion"
                checked={formData?.requirePasswordChange}
                onChange={(e) => handleInputChange('requirePasswordChange', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
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
              iconName="UserPlus"
              iconPosition="left"
            >
              Créer l'utilisateur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;