import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationHistory = ({ filters = {} }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'sendDate', direction: 'desc' });
  const [itemsPerPage] = useState(10);

  // Mock notification data
  const mockNotifications = [
    {
      id: 1,
      title: "Rappel de Paiement - Frais de Scolarité Septembre",
      recipients: "Parents - Classe 6ème A",
      recipientCount: 28,
      sendDate: "2025-09-15T09:30:00",
      status: "delivered",
      category: "payment",
      deliveryRate: 96,
      readRate: 78,
      responseRate: 12,
      template: "payment-reminder",
      content: "Rappel pour le paiement des frais de scolarité"
    },
    {
      id: 2,
      title: "Réunion Parents-Professeurs - Trimestre 1",
      recipients: "Parents - Toutes classes",
      recipientCount: 245,
      sendDate: "2025-09-14T14:15:00",
      status: "read",
      category: "event",
      deliveryRate: 98,
      readRate: 85,
      responseRate: 34,
      template: "event-announcement",
      content: "Invitation à la réunion trimestrielle"
    },
    {
      id: 3,
      title: "Résultats des Examens de Mi-Trimestre",
      recipients: "Parents & Étudiants - 3ème",
      recipientCount: 67,
      sendDate: "2025-09-13T16:45:00",
      status: "delivered",
      category: "academic",
      deliveryRate: 100,
      readRate: 92,
      responseRate: 8,
      template: "academic-results",
      content: "Consultation des résultats disponible"
    },
    {
      id: 4,
      title: "Fermeture Exceptionnelle - Maintenance",
      recipients: "Tous les utilisateurs",
      recipientCount: 892,
      sendDate: "2025-09-12T08:00:00",
      status: "read",
      category: "emergency",
      deliveryRate: 99,
      readRate: 94,
      responseRate: 2,
      template: "emergency-alert",
      content: "Information sur la fermeture temporaire"
    },
    {
      id: 5,
      title: "Nouvelle Politique de Retard",
      recipients: "Parents & Étudiants",
      recipientCount: 456,
      sendDate: "2025-09-11T11:20:00",
      status: "failed",
      category: "general",
      deliveryRate: 87,
      readRate: 65,
      responseRate: 15,
      template: "policy-update",
      content: "Mise à jour de la politique des retards"
    },
    {
      id: 6,
      title: "Sortie Éducative - Musée des Sciences",
      recipients: "Parents - 5ème B & C",
      recipientCount: 54,
      sendDate: "2025-09-16T10:00:00",
      status: "scheduled",
      category: "event",
      deliveryRate: 0,
      readRate: 0,
      responseRate: 0,
      template: "field-trip",
      content: "Autorisation parentale requise pour la sortie"
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, [filters, currentPage, sortConfig]);

  const loadNotifications = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let filteredNotifications = [...mockNotifications];

      // Apply filters
      if (filters?.searchTerm) {
        const searchTerm = filters?.searchTerm?.toLowerCase();
        filteredNotifications = filteredNotifications?.filter(notif => 
          notif?.title?.toLowerCase()?.includes(searchTerm) || 
          notif?.content?.toLowerCase()?.includes(searchTerm) ||
          notif?.recipients?.toLowerCase()?.includes(searchTerm)
        );
      }

      if (filters?.recipientType && filters?.recipientType !== '') {
        filteredNotifications = filteredNotifications?.filter(notif => 
          notif?.recipients?.toLowerCase()?.includes(filters?.recipientType?.toLowerCase())
        );
      }

      if (filters?.status && filters?.status !== '') {
        filteredNotifications = filteredNotifications?.filter(notif => 
          notif?.status === filters?.status
        );
      }

      if (filters?.category && filters?.category !== '') {
        filteredNotifications = filteredNotifications?.filter(notif => 
          notif?.category === filters?.category
        );
      }

      // Apply sorting
      filteredNotifications?.sort((a, b) => {
        const aValue = a?.[sortConfig?.key];
        const bValue = b?.[sortConfig?.key];
        
        if (sortConfig?.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });

      // Pagination
      const total = Math.ceil(filteredNotifications?.length / itemsPerPage);
      const start = (currentPage - 1) * itemsPerPage;
      const paginatedNotifications = filteredNotifications?.slice(start, start + itemsPerPage);

      setNotifications(paginatedNotifications);
      setTotalPages(total);
      setLoading(false);
    }, 500);
  };

  const getStatusIcon = (status) => {
    const statusConfig = {
      sent: { icon: 'Send', color: 'text-blue-500' },
      delivered: { icon: 'Check', color: 'text-success' },
      read: { icon: 'CheckCheck', color: 'text-primary' },
      failed: { icon: 'AlertCircle', color: 'text-error' },
      scheduled: { icon: 'Clock', color: 'text-warning' }
    };
    return statusConfig?.[status] || statusConfig?.sent;
  };

  const getCategoryIcon = (category) => {
    const categoryConfig = {
      academic: 'BookOpen',
      payment: 'CreditCard',
      event: 'Calendar',
      emergency: 'AlertTriangle',
      general: 'MessageSquare'
    };
    return categoryConfig?.[category] || 'MessageSquare';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (key) => {
    const direction = sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev?.includes(id) 
        ? prev?.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedNotifications(
      selectedNotifications?.length === notifications?.length 
        ? [] 
        : notifications?.map(n => n?.id)
    );
  };

  const handleBulkAction = (action) => {
    const selectedIds = selectedNotifications;
    console.log(`${action} notifications:`, selectedIds);
    
    switch (action) {
      case 'duplicate':
        alert(`${selectedIds?.length} notification(s) dupliquée(s)`);
        break;
      case 'archive':
        alert(`${selectedIds?.length} notification(s) archivée(s)`);
        break;
      case 'delete':
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds?.length} notification(s) ?`)) {
          setNotifications(prev => prev?.filter(n => !selectedIds?.includes(n?.id)));
          alert('Notifications supprimées');
        }
        break;
      case 'export':
        alert('Export en cours...');
        break;
    }
    
    setSelectedNotifications([]);
  };

  const handleNotificationAction = (action, notificationId) => {
    const notification = notifications?.find(n => n?.id === notificationId);
    console.log(`${action} notification:`, notification);
    
    switch (action) {
      case 'view':
        alert(`Affichage du détail de: ${notification?.title}`);
        break;
      case 'duplicate':
        alert(`Duplication de: ${notification?.title}`);
        break;
      case 'resend':
        if (confirm(`Renvoyer la notification: ${notification?.title} ?`)) {
          alert('Notification renvoyée !');
        }
        break;
      case 'edit':
        alert(`Modification de: ${notification?.title}`);
        break;
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span className="text-muted-foreground">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notifications?.length > 0 && selectedNotifications?.length === notifications?.length}
              onChange={handleSelectAll}
              className="rounded border-border"
            />
            <h3 className="text-lg font-semibold text-foreground">
              Historique des Notifications
            </h3>
            {selectedNotifications?.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({selectedNotifications?.length} sélectionnées)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedNotifications?.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  iconName="Copy"
                  onClick={() => handleBulkAction('duplicate')}
                >
                  Dupliquer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  iconName="Archive"
                  onClick={() => handleBulkAction('archive')}
                >
                  Archiver
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  iconName="Trash2"
                  onClick={() => handleBulkAction('delete')}
                >
                  Supprimer
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              iconName="Download"
              onClick={() => handleBulkAction('export')}
            >
              Exporter
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              iconName="RefreshCw"
              onClick={() => loadNotifications()}
            >
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {notifications?.length === 0 ? (
        <div className="p-8 text-center">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun résultat trouvé</h3>
          <p className="text-muted-foreground">
            Aucune notification ne correspond aux critères de recherche.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={notifications?.length > 0 && selectedNotifications?.length === notifications?.length}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Message</span>
                      <Icon name="ArrowUpDown" size={14} />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('recipients')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Destinataires</span>
                      <Icon name="ArrowUpDown" size={14} />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('sendDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date d'envoi</span>
                      <Icon name="ArrowUpDown" size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Métriques
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {notifications?.map((notification) => {
                  const statusConfig = getStatusIcon(notification?.status);
                  return (
                    <tr 
                      key={notification?.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        selectedNotifications?.includes(notification?.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifications?.includes(notification?.id)}
                          onChange={() => handleSelectNotification(notification?.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <Icon 
                              name={getCategoryIcon(notification?.category)} 
                              size={16} 
                              className="text-primary" 
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground truncate">
                              {notification?.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Modèle: {notification?.template}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">
                          {notification?.recipients}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification?.recipientCount} destinataires
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">
                          {formatDate(notification?.sendDate)}
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
                            {notification?.status === 'delivered' ? 'Livré' :
                             notification?.status === 'read' ? 'Lu' :
                             notification?.status === 'failed' ? 'Échec' :
                             notification?.status === 'scheduled' ? 'Programmé' : 'Envoyé'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <Icon name="Send" size={12} className="text-blue-500" />
                            <span>{notification?.deliveryRate}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Eye" size={12} className="text-success" />
                            <span>{notification?.readRate}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="MessageCircle" size={12} className="text-primary" />
                            <span>{notification?.responseRate}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            iconName="Eye"
                            onClick={() => handleNotificationAction('view', notification?.id)}
                            title="Voir les détails"
                          >
                            Voir
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            iconName="Copy"
                            onClick={() => handleNotificationAction('duplicate', notification?.id)}
                            title="Dupliquer"
                          >
                            Dupliquer
                          </Button>
                          {notification?.status === 'failed' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              iconName="RefreshCw"
                              onClick={() => handleNotificationAction('resend', notification?.id)}
                              title="Renvoyer"
                            >
                              Renvoyer
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            iconName="MoreHorizontal"
                            onClick={() => handleNotificationAction('edit', notification?.id)}
                            title="Plus d'options"
                          >
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
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, notifications?.length)} 
                {totalPages > 1 && ` sur ${totalPages * itemsPerPage} notifications`}
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  iconName="ChevronLeft"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Précédent
                </Button>
                
                {totalPages > 1 && (
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  iconName="ChevronRight"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationHistory;