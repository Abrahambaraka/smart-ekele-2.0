import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionPanel = ({ userRole = 'administrator', className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Quick actions based on user role and common administrative tasks
  const quickActions = [
    {
      id: 'add-student',
      label: 'Nouvel Étudiant',
      icon: 'UserPlus',
      description: 'Ajouter un étudiant',
      action: () => console.log('Add student'),
      variant: 'default'
    },
    {
      id: 'create-class',
      label: 'Nouvelle Classe',
      icon: 'Plus',
      description: 'Créer une classe',
      action: () => console.log('Create class'),
      variant: 'outline'
    },
    {
      id: 'send-notification',
      label: 'Notification',
      icon: 'Send',
      description: 'Envoyer une notification',
      action: () => console.log('Send notification'),
      variant: 'outline'
    },
    {
      id: 'generate-report',
      label: 'Rapport',
      icon: 'FileText',
      description: 'Générer un rapport',
      action: () => console.log('Generate report'),
      variant: 'outline'
    },
    {
      id: 'bulk-payment',
      label: 'Paiements',
      icon: 'CreditCard',
      description: 'Traiter les paiements',
      action: () => console.log('Process payments'),
      variant: 'outline'
    },
    {
      id: 'backup-data',
      label: 'Sauvegarde',
      icon: 'Download',
      description: 'Sauvegarder les données',
      action: () => console.log('Backup data'),
      variant: 'ghost'
    }
  ];

  const primaryActions = quickActions?.slice(0, 3);
  const secondaryActions = quickActions?.slice(3);

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Actions Rapides</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-muted transition-micro"
          aria-label={isExpanded ? 'Réduire' : 'Développer'}
        >
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-muted-foreground"
          />
        </button>
      </div>
      {/* Primary Actions - Always Visible */}
      <div className="space-y-2 mb-3">
        {primaryActions?.map((action) => (
          <Button
            key={action?.id}
            variant={action?.variant}
            size="sm"
            fullWidth
            iconName={action?.icon}
            iconPosition="left"
            onClick={action?.action}
            className="justify-start"
          >
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{action?.label}</span>
              <span className="text-xs text-muted-foreground">{action?.description}</span>
            </div>
          </Button>
        ))}
      </div>
      {/* Secondary Actions - Expandable */}
      {isExpanded && (
        <div className="space-y-2 pt-3 border-t border-border animate-accordion-down">
          {secondaryActions?.map((action) => (
            <Button
              key={action?.id}
              variant={action?.variant}
              size="sm"
              fullWidth
              iconName={action?.icon}
              iconPosition="left"
              onClick={action?.action}
              className="justify-start"
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{action?.label}</span>
                <span className="text-xs text-muted-foreground">{action?.description}</span>
              </div>
            </Button>
          ))}
        </div>
      )}
      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Raccourcis personnalisables
        </div>
      </div>
    </div>
  );
};

export default QuickActionPanel;