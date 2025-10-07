import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentActions = () => {
  const recentActions = [
    {
      id: 1,
      title: 'Rapport mensuel généré',
      description: 'Rapport de septembre 2024 créé et envoyé',
      timestamp: new Date(Date.now() - 1800000),
      type: 'report',
      status: 'completed',
      user: 'Marie Dubois'
    },
    {
      id: 2,
      title: 'Sauvegarde des données',
      description: 'Sauvegarde automatique effectuée',
      timestamp: new Date(Date.now() - 3600000),
      type: 'system',
      status: 'completed',
      user: 'Système'
    },
    {
      id: 3,
      title: 'Notification de paiement',
      description: 'Rappel envoyé à 23 parents',
      timestamp: new Date(Date.now() - 5400000),
      type: 'notification',
      status: 'completed',
      user: 'Jean Martin'
    },
    {
      id: 4,
      title: 'Mise à jour des classes',
      description: 'Horaires modifiés pour 3 classes',
      timestamp: new Date(Date.now() - 7200000),
      type: 'academic',
      status: 'completed',
      user: 'Sophie Laurent'
    },
    {
      id: 5,
      title: 'Export des données',
      description: 'Export en cours...',
      timestamp: new Date(Date.now() - 900000),
      type: 'export',
      status: 'processing',
      user: 'Marie Dubois'
    }
  ];

  const getActionIcon = (type) => {
    switch (type) {
      case 'report': return 'FileText';
      case 'system': return 'Database';
      case 'notification': return 'Send';
      case 'academic': return 'BookOpen';
      case 'export': return 'Download';
      default: return 'Activity';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'processing': return 'text-warning';
      case 'failed': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'processing': return 'Clock';
      case 'failed': return 'XCircle';
      default: return 'Circle';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return date?.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="History" size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Actions Récentes</h3>
        </div>
        <Button variant="outline" size="sm" iconName="ExternalLink">
          Journal complet
        </Button>
      </div>
      <div className="space-y-3">
        {recentActions?.map((action) => (
          <div 
            key={action?.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-micro"
          >
            <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
              <Icon 
                name={getActionIcon(action?.type)} 
                size={14} 
                className="text-muted-foreground"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {action?.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={getStatusIcon(action?.status)} 
                    size={12} 
                    className={getStatusColor(action?.status)}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(action?.timestamp)}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">
                {action?.description}
              </p>
              
              <div className="text-xs text-muted-foreground">
                Par {action?.user}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {recentActions?.filter(a => a?.status === 'completed')?.length} actions terminées aujourd'hui
          </span>
          <span className="text-muted-foreground">
            {recentActions?.filter(a => a?.status === 'processing')?.length} en cours
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecentActions;