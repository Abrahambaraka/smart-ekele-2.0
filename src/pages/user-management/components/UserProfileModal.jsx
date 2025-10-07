import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const UserProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Actif', className: 'bg-success/10 text-success border-success/20' },
      inactive: { label: 'Inactif', className: 'bg-muted text-muted-foreground border-border' },
      suspended: { label: 'Suspendu', className: 'bg-warning/10 text-warning border-warning/20' },
      pending: { label: 'En attente', className: 'bg-primary/10 text-primary border-primary/20' }
    };

    const config = statusConfig?.[status] || statusConfig?.inactive;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      administrator: { label: 'Administrateur', className: 'bg-error/10 text-error border-error/20', icon: 'Shield' },
      teacher: { label: 'Enseignant', className: 'bg-primary/10 text-primary border-primary/20', icon: 'BookOpen' },
      student: { label: 'Étudiant', className: 'bg-accent/10 text-accent border-accent/20', icon: 'GraduationCap' },
      parent: { label: 'Parent', className: 'bg-secondary/10 text-secondary border-secondary/20', icon: 'Users' }
    };

    const config = roleConfig?.[role] || roleConfig?.student;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config?.className}`}>
        <Icon name={config?.icon} size={14} className="mr-1.5" />
        {config?.label}
      </span>
    );
  };

  const formatLastLogin = (date) => {
    if (!date) return 'Jamais connecté';
    const now = new Date();
    const loginDate = new Date(date);
    const diffInHours = Math.floor((now - loginDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`;
    return loginDate?.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mockActivityData = [
    { action: 'Connexion', timestamp: new Date(Date.now() - 3600000), details: 'Connexion depuis Chrome' },
    { action: 'Modification profil', timestamp: new Date(Date.now() - 86400000), details: 'Mise à jour du numéro de téléphone' },
    { action: 'Création classe', timestamp: new Date(Date.now() - 172800000), details: 'Nouvelle classe CM1-A créée' },
    { action: 'Envoi notification', timestamp: new Date(Date.now() - 259200000), details: 'Notification aux parents' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
              <Image
                src={user?.avatar}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {getRoleBadge(user?.role)}
                {getStatusBadge(user?.status)}
              </div>
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

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="User" size={20} className="mr-2 text-primary" />
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nom complet</label>
                    <p className="text-foreground font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="text-foreground font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <p className="text-foreground font-medium">{user?.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Rôle</label>
                    <div className="mt-1">{getRoleBadge(user?.role)}</div>
                  </div>
                </div>
              </div>

              {/* Role-specific Information */}
              {user?.role === 'teacher' && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Icon name="BookOpen" size={20} className="mr-2 text-primary" />
                    Informations enseignant
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Classes assignées</label>
                      <p className="text-foreground font-medium">{user?.associatedData || 'Aucune classe'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Matières</label>
                      <p className="text-foreground font-medium">Mathématiques, Sciences</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Nombre d'étudiants</label>
                      <p className="text-foreground font-medium">28 étudiants</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Ancienneté</label>
                      <p className="text-foreground font-medium">3 ans</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Activity" size={20} className="mr-2 text-primary" />
                  Activité récente
                </h3>
                <div className="space-y-3">
                  {mockActivityData?.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{activity?.action}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatLastLogin(activity?.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{activity?.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Settings" size={20} className="mr-2 text-primary" />
                  Statut du compte
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Statut</span>
                    {getStatusBadge(user?.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dernière connexion</span>
                    <span className="text-sm text-foreground">{formatLastLogin(user?.lastLogin)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Créé le</span>
                    <span className="text-sm text-foreground">15/09/2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ID utilisateur</span>
                    <span className="text-sm font-mono text-foreground">{user?.id}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="Zap" size={20} className="mr-2 text-primary" />
                  Actions rapides
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    iconName="Edit"
                    iconPosition="left"
                    onClick={() => console.log('Edit user')}
                  >
                    Modifier le profil
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    iconName="Key"
                    iconPosition="left"
                    onClick={() => console.log('Reset password')}
                  >
                    Réinitialiser le mot de passe
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    iconName="Mail"
                    iconPosition="left"
                    onClick={() => console.log('Send email')}
                  >
                    Envoyer un email
                  </Button>
                  {user?.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      iconName="UserX"
                      iconPosition="left"
                      onClick={() => console.log('Deactivate user')}
                      className="text-warning hover:bg-warning/10"
                    >
                      Désactiver le compte
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      iconName="UserCheck"
                      iconPosition="left"
                      onClick={() => console.log('Activate user')}
                      className="text-success hover:bg-success/10"
                    >
                      Activer le compte
                    </Button>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Icon name="BarChart3" size={20} className="mr-2 text-primary" />
                  Statistiques
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Connexions ce mois</span>
                    <span className="text-sm font-medium text-foreground">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Actions effectuées</span>
                    <span className="text-sm font-medium text-foreground">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Temps moyen/session</span>
                    <span className="text-sm font-medium text-foreground">45 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            iconName="Edit"
            iconPosition="left"
            onClick={() => console.log('Edit user from profile')}
          >
            Modifier l'utilisateur
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;