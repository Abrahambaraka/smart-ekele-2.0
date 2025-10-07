import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionsPanel = ({ 
  selectedStudents, 
  onClearSelection, 
  onBulkDelete, 
  onBulkClassTransfer, 
  onBulkExport,
  onBulkStatusChange 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showClassTransfer, setShowClassTransfer] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [targetClass, setTargetClass] = useState('');
  const [targetStatus, setTargetStatus] = useState('');

  if (selectedStudents?.length === 0) return null;

  const classOptions = [
    '6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B',
    '3ème A', '3ème B', '2nde A', '2nde B', '1ère S', '1ère L',
    'Terminale S', 'Terminale L'
  ];

  const statusOptions = [
    { value: 'Actif', label: 'Actif' },
    { value: 'Inactif', label: 'Inactif' },
    { value: 'Suspendu', label: 'Suspendu' },
    { value: 'Diplômé', label: 'Diplômé' }
  ];

  const handleClassTransfer = () => {
    if (targetClass) {
      onBulkClassTransfer(selectedStudents, targetClass);
      setShowClassTransfer(false);
      setTargetClass('');
    }
  };

  const handleStatusChange = () => {
    if (targetStatus) {
      onBulkStatusChange(selectedStudents, targetStatus);
      setShowStatusChange(false);
      setTargetStatus('');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-200">
      <div className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-96">
        {/* Main Panel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {selectedStudents?.length}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {selectedStudents?.length} étudiant(s) sélectionné(s)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              iconName={showActions ? "ChevronDown" : "ChevronUp"}
              iconPosition="right"
            >
              Actions
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              className="h-8 w-8"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        </div>

        {/* Expanded Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkExport(selectedStudents)}
                iconName="Download"
                iconPosition="left"
                className="justify-start"
              >
                Exporter
              </Button>

              {/* Class Transfer */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClassTransfer(true)}
                iconName="ArrowRight"
                iconPosition="left"
                className="justify-start"
              >
                Transférer
              </Button>

              {/* Status Change */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusChange(true)}
                iconName="Edit"
                iconPosition="left"
                className="justify-start"
              >
                Statut
              </Button>

              {/* Delete */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBulkDelete(selectedStudents)}
                iconName="Trash2"
                iconPosition="left"
                className="justify-start"
              >
                Supprimer
              </Button>
            </div>
          </div>
        )}

        {/* Class Transfer Modal */}
        {showClassTransfer && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Transférer vers une nouvelle classe
            </h4>
            <div className="flex items-center space-x-2">
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e?.target?.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sélectionner une classe</option>
                {classOptions?.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleClassTransfer}
                disabled={!targetClass}
                iconName="Check"
              >
                Confirmer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClassTransfer(false)}
                iconName="X"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusChange && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Modifier le statut
            </h4>
            <div className="flex items-center space-x-2">
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e?.target?.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sélectionner un statut</option>
                {statusOptions?.map((status) => (
                  <option key={status?.value} value={status?.value}>
                    {status?.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleStatusChange}
                disabled={!targetStatus}
                iconName="Check"
              >
                Confirmer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStatusChange(false)}
                iconName="X"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActionsPanel;