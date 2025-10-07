import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const PaymentTable = ({ 
  payments = [], 
  loading = false, 
  filters = {}, 
  onRecordPayment, 
  onSendReminder, 
  onViewHistory,
  onPaymentUpdate 
}) => {
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'due_date', direction: 'desc' });

  // Transform payments data for display
  const displayPayments = useMemo(() => {
    if (!payments || payments?.length === 0) return [];

    let filtered = payments;

    // Apply filters
    if (filters?.status && filters?.status !== 'all') {
      filtered = filtered?.filter(p => p?.status === filters?.status);
    }

    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(p => 
        p?.student?.full_name?.toLowerCase()?.includes(searchTerm) ||
        p?.student?.student_id?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Apply sorting
    filtered = [...filtered]?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];

      // Handle nested properties
      if (sortConfig?.key === 'studentName') {
        aValue = a?.student?.full_name || '';
        bValue = b?.student?.full_name || '';
      }

      if (sortConfig?.key === 'amountDue') {
        aValue = parseFloat(a?.amount) || 0;
        bValue = parseFloat(b?.amount) || 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = (bValue || '')?.toLowerCase();
      }

      if (sortConfig?.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered?.map(payment => ({
      id: payment?.id,
      studentName: payment?.student?.full_name || 'Nom non disponible',
      studentId: payment?.student?.student_id || 'ID non disponible',
      class: 'Classe non disponible', // Would need enrollment data
      amountDue: parseFloat(payment?.amount) || 0,
      amountPaid: payment?.status === 'paid' ? parseFloat(payment?.amount) || 0 : 0,
      balance: payment?.status === 'paid' ? 0 : parseFloat(payment?.amount) || 0,
      status: payment?.status || 'pending',
      dueDate: payment?.due_date,
      paymentDate: payment?.paid_date,
      paymentMethod: payment?.payment_method,
      parentEmail: payment?.student?.parent_email,
      parentPhone: payment?.student?.parent_phone,
      monthYear: payment?.month_year,
      notes: payment?.notes
    }));
  }, [payments, filters, sortConfig]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: 'Payé', color: 'bg-success/10 text-success', icon: 'CheckCircle' },
      pending: { label: 'En attente', color: 'bg-warning/10 text-warning', icon: 'Clock' },
      overdue: { label: 'En retard', color: 'bg-error/10 text-error', icon: 'AlertTriangle' },
      partial: { label: 'Partiel', color: 'bg-primary/10 text-primary', icon: 'MinusCircle' }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span>{config?.label}</span>
      </div>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      cash: { label: '💵 Espèces', color: 'bg-green-100 text-green-800 border-green-200', icon: 'Banknote' },
      bank_transfer: { label: '🏦 Virement', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'Building2' },
      card: { label: '💳 Carte', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: 'CreditCard' },
      check: { label: '📝 Chèque', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'FileText' },
      mobile_payment: { label: '📱 Mobile', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: 'Smartphone' }
    };

    const config = methodConfig?.[method] || { label: method || '-', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: 'HelpCircle' };
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span>{config?.label}</span>
      </div>
    );
  };

  const handleRecordCashPayment = (payment) => {
    onRecordPayment?.({
      id: payment?.studentId,
      full_name: payment?.studentName
    });
  };

  const handlePrintCashReceipt = async (payment) => {
    // Generate a simple cash receipt
    const receiptContent = `
      <div style="max-width: 400px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0;">REÇU DE PAIEMENT</h2>
          <p style="margin: 5px 0;">Frais de Scolarité</p>
          <p style="margin: 0; font-weight: bold;">N° CASH-${Date.now()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p><strong>Étudiant:</strong> ${payment?.studentName}</p>
          <p><strong>ID Étudiant:</strong> ${payment?.studentId}</p>
          <p><strong>Période:</strong> ${payment?.monthYear || '-'}</p>
          <p><strong>Date:</strong> ${new Date()?.toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div style="border-top: 1px solid #ccc; padding-top: 10px; margin-bottom: 15px;">
          <p><strong>Montant:</strong> ${formatCurrency(payment?.amountDue)}</p>
          <p><strong>Méthode:</strong> Paiement en Espèces</p>
          <p><strong>Statut:</strong> ${payment?.status === 'paid' ? 'PAYÉ' : 'À PAYER'}</p>
        </div>
        
        <div style="text-align: center; border-top: 1px solid #ccc; padding-top: 10px;">
          <p style="margin: 0;">Merci pour votre paiement!</p>
          <p style="margin: 5px 0; font-size: 10px;">Conservez ce reçu comme preuve de paiement</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document?.write(`
      <html>
        <head><title>Reçu de Paiement</title></head>
        <body onload="window.print(); window.close();">
          ${receiptContent}
        </body>
      </html>
    `);
    printWindow?.document?.close();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount) + ' FCFA';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('fr-FR')?.format(new Date(dateString));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPayments(displayPayments?.map(payment => payment?.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId, checked) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, paymentId]);
    } else {
      setSelectedPayments(selectedPayments?.filter(id => id !== paymentId));
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header Actions */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-foreground">Paiements des Étudiants</h3>
            {selectedPayments?.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedPayments?.length} élément(s) sélectionné(s)
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedPayments?.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Send"
                  iconPosition="left"
                  onClick={() => onSendReminder?.(selectedPayments)}
                >
                  Envoyer Rappels
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                >
                  Exporter
                </Button>
              </>
            )}
            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              onClick={() => onRecordPayment?.()}
            >
              Enregistrer Paiement
            </Button>
          </div>
        </div>
      </div>
      {displayPayments?.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Receipt" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun paiement trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Il n'y a pas encore de paiements enregistrés ou ils ne correspondent pas aux filtres appliqués.
          </p>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => onRecordPayment?.()}
          >
            Créer un Paiement
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 p-4">
                    <Checkbox
                      checked={selectedPayments?.length === displayPayments?.length && displayPayments?.length > 0}
                      onChange={(e) => handleSelectAll(e?.target?.checked)}
                    />
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('studentName')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>Étudiant</span>
                      {getSortIcon('studentName')}
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('monthYear')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>Période</span>
                      {getSortIcon('monthYear')}
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('amountDue')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>Montant</span>
                      {getSortIcon('amountDue')}
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>Statut</span>
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('dueDate')}
                      className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      <span>Date d'Échéance</span>
                      {getSortIcon('dueDate')}
                    </button>
                  </th>
                  <th className="text-left p-4">Méthode</th>
                  <th className="text-center p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayPayments?.map((payment) => (
                  <tr key={payment?.id} className="border-b border-border hover:bg-muted/30 transition-micro">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedPayments?.includes(payment?.id)}
                        onChange={(e) => handleSelectPayment(payment?.id, e?.target?.checked)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{payment?.studentName}</div>
                        <div className="text-sm text-muted-foreground">{payment?.studentId}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-foreground">{payment?.monthYear || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{formatCurrency(payment?.amountDue)}</div>
                        {payment?.amountPaid > 0 && (
                          <div className="text-sm text-success">Payé: {formatCurrency(payment?.amountPaid)}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(payment?.status)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-foreground">{formatDate(payment?.dueDate)}</div>
                      {payment?.paymentDate && (
                        <div className="text-xs text-muted-foreground">
                          Payé: {formatDate(payment?.paymentDate)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {getPaymentMethodBadge(payment?.paymentMethod)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="Eye"
                          onClick={() => onViewHistory?.(payment?.id)}
                          className="w-8 h-8"
                          title="Voir détails"
                        />
                        {payment?.status !== 'paid' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            iconName="Banknote"
                            onClick={() => handleRecordCashPayment(payment)}
                            className="w-8 h-8 text-green-600 hover:bg-green-50"
                            title="Paiement Espèces"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="Printer"
                          onClick={() => handlePrintCashReceipt(payment)}
                          className="w-8 h-8"
                          title="Imprimer reçu"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          iconName="MessageCircle"
                          className="w-8 h-8"
                          title="Envoyer rappel WhatsApp"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden space-y-4 p-4">
            {displayPayments?.map((payment) => (
              <div key={payment?.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedPayments?.includes(payment?.id)}
                      onChange={(e) => handleSelectPayment(payment?.id, e?.target?.checked)}
                    />
                    <div>
                      <div className="font-medium text-foreground">{payment?.studentName}</div>
                      <div className="text-sm text-muted-foreground">{payment?.monthYear}</div>
                    </div>
                  </div>
                  {getStatusBadge(payment?.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Montant:</span>
                    <div className="font-medium text-foreground">{formatCurrency(payment?.amountDue)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Échéance:</span>
                    <div className="font-medium text-foreground">{formatDate(payment?.dueDate)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Méthode:</span>
                    <div className="font-medium text-foreground">{getPaymentMethodBadge(payment?.paymentMethod)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Parent:</span>
                    <div className="font-medium text-foreground">{payment?.parentPhone || '-'}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    ID: {payment?.studentId}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      onClick={() => onViewHistory?.(payment?.id)}
                    >
                      Détails
                    </Button>
                    {payment?.status !== 'paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Banknote"
                        onClick={() => handleRecordCashPayment(payment)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Espèces
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Printer"
                      onClick={() => handlePrintCashReceipt(payment)}
                    >
                      Reçu
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Affichage de {displayPayments?.length} paiement(s)
              </div>
              <div className="flex items-center space-x-4">
                <span>Total sélectionné: {selectedPayments?.length}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentTable;