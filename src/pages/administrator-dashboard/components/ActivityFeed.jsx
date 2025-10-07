import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: 'user_created',
      title: 'Nouvel utilisateur créé',
      description: 'Marie Dubois a créé un compte enseignant pour Jean Martin',
      timestamp: new Date(Date.now() - 300000),
      icon: 'UserPlus',
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
      user: {
        name: 'Marie Dubois',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
      }
    },
    {
      id: 2,
      type: 'payment_received',
      title: 'Paiement reçu',
      description: 'Paiement de 450€ reçu pour Sophie Laurent - Classe 3ème A',
      timestamp: new Date(Date.now() - 900000),
      icon: 'CreditCard',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      amount: '450€'
    },
    {
      id: 3,
      type: 'class_created',
      title: 'Nouvelle classe créée',
      description: 'Classe "Terminale S" créée avec 25 places disponibles',
      timestamp: new Date(Date.now() - 1800000),
      icon: 'BookOpen',
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10'
    },
    {
      id: 4,
      type: 'notification_sent',
      title: 'Notification envoyée',
      description: 'Rappel de paiement envoyé à 45 parents',
      timestamp: new Date(Date.now() - 3600000),
      icon: 'Send',
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10'
    },
    {
      id: 5,
      type: 'student_enrolled',
      title: 'Nouvel étudiant inscrit',
      description: 'Lucas Moreau inscrit en 2nde B',
      timestamp: new Date(Date.now() - 7200000),
      icon: 'UserCheck',
      iconColor: 'text-success',
      iconBg: 'bg-success/10'
    }
  ];

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
          <Icon name="Activity" size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Activités Récentes</h3>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 transition-micro">
          Voir tout
        </button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-micro">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity?.iconBg}`}>
              <Icon name={activity?.icon} size={14} className={activity?.iconColor} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {activity?.title}
                </h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatTime(activity?.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {activity?.description}
              </p>

              {activity?.user && (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src={activity?.user?.avatar}
                      alt={activity?.user?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity?.user?.name}
                  </span>
                </div>
              )}

              {activity?.amount && (
                <div className="inline-flex items-center px-2 py-1 bg-success/10 text-success text-xs font-medium rounded">
                  {activity?.amount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Dernière mise à jour: {new Date()?.toLocaleTimeString('fr-FR')}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;