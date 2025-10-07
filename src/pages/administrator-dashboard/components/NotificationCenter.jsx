import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'Paiement en retard critique',
      message: '15 étudiants ont des paiements en retard de plus de 30 jours',
      timestamp: new Date(Date.now() - 1800000),
      priority: 'high',
      actionRequired: true,
      actions: [
        { label: 'Envoyer rappel', action: () => console.log('Send reminder') },
        { label: 'Voir détails', action: () => console.log('View details') }
      ]
    },
    {
      id: 2,
      type: 'system',
      title: 'Sauvegarde automatique',
      message: 'La sauvegarde quotidienne a été effectuée avec succès',
      timestamp: new Date(Date.now() - 3600000),
      priority: 'low',
      actionRequired: false
    },
    {
      id: 3,
      type: 'academic',
      title: 'Nouvelle inscription',
      message: 'Emma Rousseau s\'est inscrite en Terminale L',
      timestamp: new Date(Date.now() - 7200000),
      priority: 'medium',
      actionRequired: true,
      actions: [
        { label: 'Valider inscription', action: () => console.log('Validate enrollment') }
      ]
    },
    {
      id: 4,
      type: 'financial',
      title: 'Objectif mensuel atteint',
      message: 'Les revenus de septembre ont dépassé l\'objectif de 5%',
      timestamp: new Date(Date.now() - 10800000),
      priority: 'medium',
      actionRequired: false
    },
    {
      id: 5,
      type: 'system',
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version du système est disponible',
      timestamp: new Date(Date.now() - 14400000),
      priority: 'medium',
      actionRequired: true,
      actions: [
        { label: 'Planifier mise à jour', action: () => console.log('Schedule update') }
      ]
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error/10';
      case 'medium': return 'bg-warning/10';
      case 'low': return 'bg-success/10';
      default: return 'bg-muted/10';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return 'AlertTriangle';
      case 'system': return 'Settings';
      case 'academic': return 'GraduationCap';
      case 'financial': return 'CreditCard';
      default: return 'Bell';
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

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return notification?.priority === 'high';
    if (filter === 'actions') return notification?.actionRequired;
    return notification?.type === filter;
  });

  const urgentCount = notifications?.filter(n => n?.priority === 'high')?.length;
  const actionCount = notifications?.filter(n => n?.actionRequired)?.length;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Bell" size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Centre de Notifications</h3>
          {urgentCount > 0 && (
            <div className="w-5 h-5 bg-error text-error-foreground rounded-full flex items-center justify-center text-xs font-medium">
              {urgentCount}
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" iconName="Settings">
          Paramètres
        </Button>
      </div>
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {[
          { key: 'all', label: 'Toutes', count: notifications?.length },
          { key: 'urgent', label: 'Urgentes', count: urgentCount },
          { key: 'actions', label: 'Actions', count: actionCount },
          { key: 'system', label: 'Système', count: notifications?.filter(n => n?.type === 'system')?.length }
        ]?.map((tab) => (
          <button
            key={tab?.key}
            onClick={() => setFilter(tab?.key)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-micro ${
              filter === tab?.key
                ? 'bg-card text-foreground elevation-1'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab?.label}
            {tab?.count > 0 && (
              <span className="ml-1 text-xs opacity-75">({tab?.count})</span>
            )}
          </button>
        ))}
      </div>
      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications?.map((notification) => (
          <div 
            key={notification?.id}
            className={`p-4 rounded-lg border transition-micro hover:border-primary/20 ${
              notification?.priority === 'high' ? 'border-error/20 bg-error/5' : 'border-border'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPriorityBg(notification?.priority)}`}>
                <Icon 
                  name={getTypeIcon(notification?.type)} 
                  size={14} 
                  className={getPriorityColor(notification?.priority)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {notification?.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatTime(notification?.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {notification?.message}
                </p>

                {notification?.actions && notification?.actions?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {notification?.actions?.map((action, index) => (
                      <Button
                        key={index}
                        variant={index === 0 ? "default" : "outline"}
                        size="xs"
                        onClick={action?.action}
                      >
                        {action?.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredNotifications?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune notification pour ce filtre</p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {actionCount} actions requises
        </div>
        <Button variant="ghost" size="sm" iconName="Archive">
          Archiver tout
        </Button>
      </div>
    </div>
  );
};

export default NotificationCenter;