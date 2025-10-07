import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeliveryTracking = () => {
  const [selectedMetric, setSelectedMetric] = useState('delivery');

  // Mock delivery tracking data
  const trackingData = {
    totalSent: 1247,
    delivered: 1198,
    read: 987,
    failed: 49,
    pending: 23,
    responses: 156
  };

  const recentDeliveries = [
    {
      id: 1,
      recipient: 'marie.martin@email.com',
      recipientName: 'Marie Martin',
      status: 'delivered',
      deliveredAt: '2025-09-15T11:25:00',
      readAt: '2025-09-15T11:28:00',
      responseAt: null,
      deliveryMethod: 'email'
    },
    {
      id: 2,
      recipient: '+33 6 12 34 56 78',
      recipientName: 'Pierre Dubois',
      status: 'read',
      deliveredAt: '2025-09-15T11:24:00',
      readAt: '2025-09-15T11:26:00',
      responseAt: '2025-09-15T11:30:00',
      deliveryMethod: 'sms'
    },
    {
      id: 3,
      recipient: 'sophie.bernard@email.com',
      recipientName: 'Sophie Bernard',
      status: 'failed',
      deliveredAt: null,
      readAt: null,
      responseAt: null,
      deliveryMethod: 'email',
      failureReason: 'Adresse email invalide'
    },
    {
      id: 4,
      recipient: 'jean.moreau@email.com',
      recipientName: 'Jean Moreau',
      status: 'pending',
      deliveredAt: null,
      readAt: null,
      responseAt: null,
      deliveryMethod: 'email'
    }
  ];

  const getStatusIcon = (status) => {
    const statusConfig = {
      delivered: { icon: 'Check', color: 'text-success' },
      read: { icon: 'CheckCheck', color: 'text-primary' },
      failed: { icon: 'AlertCircle', color: 'text-error' },
      pending: { icon: 'Clock', color: 'text-warning' }
    };
    return statusConfig?.[status] || statusConfig?.pending;
  };

  const getDeliveryMethodIcon = (method) => {
    const methodConfig = {
      email: 'Mail',
      sms: 'MessageSquare',
      app: 'Smartphone'
    };
    return methodConfig?.[method] || 'Mail';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date?.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const metrics = [
    {
      id: 'delivery',
      label: 'Taux de Livraison',
      value: calculatePercentage(trackingData?.delivered, trackingData?.totalSent),
      count: trackingData?.delivered,
      total: trackingData?.totalSent,
      icon: 'Send',
      color: 'text-success'
    },
    {
      id: 'read',
      label: 'Taux de Lecture',
      value: calculatePercentage(trackingData?.read, trackingData?.delivered),
      count: trackingData?.read,
      total: trackingData?.delivered,
      icon: 'Eye',
      color: 'text-primary'
    },
    {
      id: 'response',
      label: 'Taux de Réponse',
      value: calculatePercentage(trackingData?.responses, trackingData?.read),
      count: trackingData?.responses,
      total: trackingData?.read,
      icon: 'MessageCircle',
      color: 'text-accent'
    },
    {
      id: 'failure',
      label: 'Taux d\'Échec',
      value: calculatePercentage(trackingData?.failed, trackingData?.totalSent),
      count: trackingData?.failed,
      total: trackingData?.totalSent,
      icon: 'AlertTriangle',
      color: 'text-error'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Suivi des Livraisons
          </h3>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics?.map((metric) => (
            <div
              key={metric?.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedMetric === metric?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedMetric(metric?.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon name={metric?.icon} size={20} className={metric?.color} />
                <span className={`text-2xl font-bold ${metric?.color}`}>
                  {metric?.value}%
                </span>
              </div>
              <div className="text-sm font-medium text-foreground mb-1">
                {metric?.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {metric?.count} sur {metric?.total}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Deliveries */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Livraisons Récentes
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="Filter">
                Filtrer
              </Button>
              <Button variant="outline" size="sm" iconName="Download">
                Exporter
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Destinataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Livré
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Réponse
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentDeliveries?.map((delivery) => {
                const statusConfig = getStatusIcon(delivery?.status);
                return (
                  <tr key={delivery?.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {delivery?.recipientName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {delivery?.recipient}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={getDeliveryMethodIcon(delivery?.deliveryMethod)} 
                          size={16} 
                          className="text-muted-foreground" 
                        />
                        <span className="text-sm capitalize">
                          {delivery?.deliveryMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={statusConfig?.icon} 
                          size={16} 
                          className={statusConfig?.color} 
                        />
                        <span className="text-sm capitalize">
                          {delivery?.status === 'delivered' ? 'Livré' :
                           delivery?.status === 'read' ? 'Lu' :
                           delivery?.status === 'failed' ? 'Échec' : 'En attente'}
                        </span>
                      </div>
                      {delivery?.failureReason && (
                        <div className="text-xs text-error mt-1">
                          {delivery?.failureReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatTime(delivery?.deliveredAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatTime(delivery?.readAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatTime(delivery?.responseAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {delivery?.status === 'failed' && (
                          <Button variant="ghost" size="sm" iconName="RotateCcw">
                            Réessayer
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" iconName="Eye">
                          Détails
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage de 1 à {recentDeliveries?.length} sur {recentDeliveries?.length} livraisons
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled iconName="ChevronLeft">
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled iconName="ChevronRight">
                Suivant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;