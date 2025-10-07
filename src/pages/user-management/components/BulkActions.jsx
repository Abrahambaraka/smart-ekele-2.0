import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ selectedUsers, onBulkAction, totalUsers }) => {
  const [selectedAction, setSelectedAction] = useState('');

  const bulkActionOptions = [
    { value: '', label: 'Sélectionner une action...' },
    { value: 'activate', label: 'Activer les utilisateurs' },
    { value: 'deactivate', label: 'Désactiver les utilisateurs' },
    { value: 'suspend', label: 'Suspendre les utilisateurs' },
    { value: 'reset-password', label: 'Réinitialiser les mots de passe' },
    { value: 'export', label: 'Exporter les données' },
    { value: 'delete', label: 'Supprimer les utilisateurs' }
  ];

  const handleExecuteAction = () => {
    if (selectedAction && selectedUsers?.length > 0) {
      onBulkAction(selectedAction, selectedUsers);
      setSelectedAction('');
    }
  };

  const getActionIcon = (action) => {
    const iconMap = {
      activate: 'CheckCircle',
      deactivate: 'XCircle',
      suspend: 'Pause',
      'reset-password': 'Key',
      export: 'Download',
      delete: 'Trash2'
    };
    return iconMap?.[action] || 'Settings';
  };

  const getActionVariant = (action) => {
    if (action === 'delete') return 'destructive';
    if (action === 'suspend') return 'warning';
    if (action === 'activate') return 'success';
    return 'default';
  };

  if (selectedUsers?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Sélectionnez des utilisateurs pour effectuer des actions en lot
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalUsers} utilisateurs au total
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        {/* Selection Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {selectedUsers?.length} utilisateur{selectedUsers?.length > 1 ? 's' : ''} sélectionné{selectedUsers?.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <button
            onClick={() => onBulkAction('clear-selection', [])}
            className="text-sm text-muted-foreground hover:text-foreground transition-micro"
          >
            Tout désélectionner
          </button>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none sm:w-64">
            <Select
              placeholder="Actions en lot..."
              options={bulkActionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
            />
          </div>
          
          <Button
            variant={getActionVariant(selectedAction)}
            iconName={getActionIcon(selectedAction)}
            iconPosition="left"
            onClick={handleExecuteAction}
            disabled={!selectedAction}
            className="whitespace-nowrap"
          >
            Exécuter
          </Button>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Actions rapides:</span>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="CheckCircle"
            iconPosition="left"
            onClick={() => onBulkAction('activate', selectedUsers)}
            className="text-success hover:bg-success/10"
          >
            Activer
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="XCircle"
            iconPosition="left"
            onClick={() => onBulkAction('deactivate', selectedUsers)}
            className="text-warning hover:bg-warning/10"
          >
            Désactiver
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={() => onBulkAction('export', selectedUsers)}
          >
            Exporter
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            iconPosition="left"
            onClick={() => onBulkAction('delete', selectedUsers)}
            className="text-destructive hover:bg-destructive/10"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;