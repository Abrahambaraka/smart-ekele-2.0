import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentHistoryModal = ({ isOpen, onClose, paymentId }) => {
  const [activeTab, setActiveTab] = useState('history');

  // Mock payment history data
  const paymentHistory = [
    {
      id: 'hist-001',
      date: '2025-09-12',
      amount: 450.00,
      method: 'Virement bancaire',
      reference: 'TXN-1726147200-ABC123',
      status: 'completed',
      processedBy: 'Marie Dubois',
      notes: 'Paiement complet des frais de septembre'
    },
    {
      id: 'hist-002',
      date: '2025-08-15',
      amount: 450.00,
      method: 'Carte bancaire',
      reference: 'TXN-1723680000-DEF456',
      status: 'completed',
      processedBy: 'Pierre Martin',
      notes: 'Paiement des frais d\'août'
    },
    {
      id: 'hist-003',
      date: '2025-07-10',
      amount: 225.00,
      method: 'Espèces',
      reference: 'TXN-1720569600-GHI789',
      status: 'completed',
      processedBy: 'Sophie Bernard',
      notes: 'Paiement partiel - Première partie'
    },
    {
      id: 'hist-004',
      date: '2025-07-20',
      amount: 225.00,
      method: 'Espèces',
      reference: 'TXN-1721433600-JKL012',
      status: 'completed',
      processedBy: 'Sophie Bernard',
      notes: 'Paiement partiel - Deuxième partie'
    }
  ];

  const communicationHistory = [
    {
      id: 'comm-001',
      date: '2025-09-10',
      type: 'email',
      subject: 'Rappel de Paiement - Frais de Scolarité',
      status: 'sent',
      recipient: 'parent.dubois@email.fr'
    },
    {
      id: 'comm-002',
      date: '2025-09-05',
      type: 'sms',
      subject: 'Rappel: Échéance de paiement le 15/09',
      status: 'delivered',
      recipient: '+33 6 12 34 56 78'
    },
    {
      id: 'comm-003',
      date: '2025-08-30',
      type: 'email',
      subject: 'Facture Septembre 2025',
      status: 'opened',
      recipient: 'parent.dubois@email.fr'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(dateString));
  };

  const getStatusBadge = (status, type = 'payment') => {
    const configs = {
      payment: {
        completed: { label: 'Terminé', color: 'bg-success/10 text-success', icon: 'CheckCircle' },
        pending: { label: 'En attente', color: 'bg-warning/10 text-warning', icon: 'Clock' },
        failed: { label: 'Échoué', color: 'bg-error/10 text-error', icon: 'XCircle' }
      },
      communication: {
        sent: { label: 'Envoyé', color: 'bg-primary/10 text-primary', icon: 'Send' },
        delivered: { label: 'Livré', color: 'bg-success/10 text-success', icon: 'CheckCircle' },
        opened: { label: 'Ouvert', color: 'bg-success/10 text-success', icon: 'Eye' },
        failed: { label: 'Échoué', color: 'bg-error/10 text-error', icon: 'XCircle' }
      }
    };

    const config = configs?.[type]?.[status] || configs?.[type]?.sent;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span>{config?.label}</span>
      </div>
    );
  };

  const getCommunicationIcon = (type) => {
    const icons = {
      email: 'Mail',
      sms: 'MessageSquare',
      call: 'Phone'
    };
    return icons?.[type] || 'MessageSquare';
  };

  const tabs = [
    { id: 'history', label: 'Historique des Paiements', icon: 'CreditCard' },
    { id: 'communications', label: 'Communications', icon: 'MessageSquare' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="History" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Historique des Paiements</h2>
              <p className="text-sm text-muted-foreground">ID: {paymentId}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={onClose}
            className="w-8 h-8"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-1 p-1 mx-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-micro ${
                  activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Transactions</h3>
                <div className="text-sm text-muted-foreground">
                  {paymentHistory?.length} transaction(s)
                </div>
              </div>

              {paymentHistory?.map((transaction) => (
                <div key={transaction?.id} className="bg-muted/30 border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                        <Icon name="CheckCircle" size={20} className="text-success" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {formatCurrency(transaction?.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction?.date)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(transaction?.status, 'payment')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Méthode:</span>
                      <div className="font-medium text-foreground">{transaction?.method}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Référence:</span>
                      <div className="font-medium text-foreground font-mono text-xs">
                        {transaction?.reference}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Traité par:</span>
                      <div className="font-medium text-foreground">{transaction?.processedBy}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Notes:</span>
                      <div className="font-medium text-foreground">{transaction?.notes}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-4 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                    >
                      Télécharger Reçu
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Historique des Communications</h3>
                <div className="text-sm text-muted-foreground">
                  {communicationHistory?.length} message(s)
                </div>
              </div>

              {communicationHistory?.map((comm) => (
                <div key={comm?.id} className="bg-muted/30 border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name={getCommunicationIcon(comm?.type)} size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{comm?.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(comm?.date)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(comm?.status, 'communication')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium text-foreground capitalize">{comm?.type}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Destinataire:</span>
                      <div className="font-medium text-foreground">{comm?.recipient}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Dernière mise à jour: {formatDate(new Date())}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
              >
                Exporter Historique
              </Button>
              <Button
                variant="default"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;