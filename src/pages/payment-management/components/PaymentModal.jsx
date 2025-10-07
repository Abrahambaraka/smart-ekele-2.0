import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { createPayment, getStudentsBySchool } from '../../../services/supabaseService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PaymentModal = ({ isOpen, onClose, studentData = null, onPaymentCreated }) => {
  const { userProfile, isSchoolAdmin } = useAuth();
  const [paymentData, setPaymentData] = useState({
    studentId: studentData?.id || '',
    studentName: studentData?.full_name || '',
    amount: '',
    paymentMethod: '',
    transactionRef: '',
    paymentDate: new Date()?.toISOString()?.split('T')?.[0],
    monthYear: `${new Date()?.getFullYear()}-${String(new Date()?.getMonth() + 1)?.padStart(2, '0')}`,
    notes: '',
    cashReceived: '',
    changeGiven: ''
  });

  const [students, setStudents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [receiptData, setReceiptData] = useState(null);

  const paymentMethods = [
    { value: 'cash', label: 'Paiement en Espèces 💵' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'card', label: 'Carte bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'mobile_payment', label: 'Paiement mobile' }
  ];

  // Load students for dropdown
  useEffect(() => {
    const loadStudents = async () => {
      if (isSchoolAdmin() && userProfile?.school_id) {
        try {
          const studentsData = await getStudentsBySchool(userProfile?.school_id);
          setStudents(studentsData || []);
        } catch (error) {
          console.error('Error loading students:', error);
        }
      }
    };

    if (isOpen && !studentData) {
      loadStudents();
    }
  }, [isOpen, userProfile, isSchoolAdmin, studentData]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaymentData({
        studentId: studentData?.id || '',
        studentName: studentData?.full_name || '',
        amount: '',
        paymentMethod: '',
        transactionRef: '',
        paymentDate: new Date()?.toISOString()?.split('T')?.[0],
        monthYear: `${new Date()?.getFullYear()}-${String(new Date()?.getMonth() + 1)?.padStart(2, '0')}`,
        notes: '',
        cashReceived: '',
        changeGiven: ''
      });
      setErrors({});
      setReceiptData(null);
    }
  }, [isOpen, studentData]);

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Handle cash payment calculations
    if (field === 'cashReceived' || field === 'amount') {
      const received = field === 'cashReceived' ? parseFloat(value) || 0 : parseFloat(paymentData?.cashReceived) || 0;
      const amount = field === 'amount' ? parseFloat(value) || 0 : parseFloat(paymentData?.amount) || 0;
      
      if (received > 0 && amount > 0) {
        const change = received - amount;
        setPaymentData(prev => ({
          ...prev,
          changeGiven: change > 0 ? change?.toFixed(2) : '0.00'
        }));
      }
    }
  };

  const handleStudentSelect = (studentId) => {
    const selectedStudent = students?.find(s => s?.id === studentId);
    if (selectedStudent) {
      setPaymentData(prev => ({
        ...prev,
        studentId: studentId,
        studentName: selectedStudent?.full_name
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData?.studentId) {
      newErrors.studentId = 'Sélectionnez un étudiant';
    }
    
    if (!paymentData?.amount || parseFloat(paymentData?.amount) <= 0) {
      newErrors.amount = 'Montant requis et doit être positif';
    }

    if (!paymentData?.paymentMethod) {
      newErrors.paymentMethod = 'Méthode de paiement requise';
    }

    if (paymentData?.paymentMethod === 'cash') {
      if (!paymentData?.cashReceived || parseFloat(paymentData?.cashReceived) <= 0) {
        newErrors.cashReceived = 'Montant reçu en espèces requis';
      } else if (parseFloat(paymentData?.cashReceived) < parseFloat(paymentData?.amount)) {
        newErrors.cashReceived = 'Montant insuffisant';
      }
    }

    if (!paymentData?.monthYear) {
      newErrors.monthYear = 'Période requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const generateTransactionRef = () => {
    const method = paymentData?.paymentMethod?.toUpperCase() || 'PAY';
    const date = new Date()?.toISOString()?.slice(0, 10)?.replace(/-/g, '');
    const random = Math.random()?.toString(36)?.substr(2, 6)?.toUpperCase();
    const ref = `${method}-${date}-${random}`;
    handleInputChange('transactionRef', ref);
  };

  const generateCashReceiptNumber = () => {
    const date = new Date()?.toISOString()?.slice(0, 10)?.replace(/-/g, '');
    const time = new Date()?.toTimeString()?.slice(0, 5)?.replace(':', '');
    const random = Math.random()?.toString(36)?.substr(2, 4)?.toUpperCase();
    return `CASH-${date}-${time}-${random}`;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare payment data for database
      const paymentPayload = {
        student_id: paymentData?.studentId,
        school_id: userProfile?.school_id || userProfile?.id,
        amount: parseFloat(paymentData?.amount),
        payment_method: paymentData?.paymentMethod,
        status: 'paid', // Cash payments are immediately paid
        paid_date: paymentData?.paymentDate,
        due_date: paymentData?.paymentDate, // Same as paid date for manual entries
        month_year: paymentData?.monthYear,
        notes: paymentData?.notes
      };

      // Add transaction reference
      if (paymentData?.transactionRef) {
        paymentPayload.notes = `${paymentPayload?.notes || ''} | Ref: ${paymentData?.transactionRef}`?.trim();
      }

      // Add cash-specific info
      if (paymentData?.paymentMethod === 'cash') {
        const cashInfo = `Espèces reçues: ${paymentData?.cashReceived} FCFA | Monnaie rendue: ${paymentData?.changeGiven} FCFA`;
        paymentPayload.notes = `${paymentPayload?.notes || ''} | ${cashInfo}`?.trim();
        
        // Generate cash receipt number
        const receiptNumber = generateCashReceiptNumber();
        paymentPayload.notes = `${paymentPayload?.notes} | Reçu: ${receiptNumber}`?.trim();
      }

      // Create payment record
      const result = await createPayment(paymentPayload);

      if (result) {
        // Prepare receipt data for cash payments
        if (paymentData?.paymentMethod === 'cash') {
          setReceiptData({
            receiptNumber: paymentData?.transactionRef || generateCashReceiptNumber(),
            studentName: paymentData?.studentName,
            amount: paymentData?.amount,
            cashReceived: paymentData?.cashReceived,
            changeGiven: paymentData?.changeGiven,
            paymentDate: paymentData?.paymentDate,
            monthYear: paymentData?.monthYear,
            school: userProfile?.full_name || 'École',
            processedBy: userProfile?.full_name || 'Administrateur'
          });
        }

        // Call the callback to refresh the parent component
        if (onPaymentCreated) {
          onPaymentCreated();
        }

        // Success message
        console.log('Paiement enregistré avec succès:', result);
        
        // For non-cash payments, close immediately
        if (paymentData?.paymentMethod !== 'cash') {
          onClose();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      setErrors({ submit: 'Erreur lors de l\'enregistrement du paiement' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (receiptData) {
      // Create print content
      const printContent = `
        <div style="max-width: 400px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 12px;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <h2 style="margin: 0;">${receiptData?.school}</h2>
            <p style="margin: 5px 0;">REÇU DE PAIEMENT EN ESPÈCES</p>
            <p style="margin: 0; font-weight: bold;">N° ${receiptData?.receiptNumber}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p><strong>Étudiant:</strong> ${receiptData?.studentName}</p>
            <p><strong>Période:</strong> ${receiptData?.monthYear}</p>
            <p><strong>Date:</strong> ${new Date(receiptData.paymentDate)?.toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div style="border-top: 1px solid #ccc; padding-top: 10px; margin-bottom: 15px;">
            <p><strong>Montant à payer:</strong> ${receiptData?.amount} FCFA</p>
            <p><strong>Espèces reçues:</strong> ${receiptData?.cashReceived} FCFA</p>
            <p><strong>Monnaie rendue:</strong> ${receiptData?.changeGiven} FCFA</p>
          </div>
          
          <div style="text-align: center; border-top: 1px solid #ccc; padding-top: 10px;">
            <p style="margin: 0;"><strong>Traité par:</strong> ${receiptData?.processedBy}</p>
            <p style="margin: 5px 0; font-size: 11px;">Merci pour votre paiement!</p>
            <p style="margin: 0; font-size: 10px;">Conservez ce reçu comme preuve de paiement</p>
          </div>
        </div>
      `;

      // Open print window
      const printWindow = window.open('', '_blank');
      printWindow?.document?.write(`
        <html>
          <head><title>Reçu de Paiement</title></head>
          <body onload="window.print(); window.close();">
            ${printContent}
          </body>
        </html>
      `);
      printWindow?.document?.close();
    }
  };

  const handleCloseAfterCash = () => {
    setReceiptData(null);
    onClose();
  };

  if (!isOpen) return null;

  // Show receipt preview for cash payments
  if (receiptData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
        <div className="bg-card border border-border rounded-lg w-full max-w-md">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Paiement Enregistré!</h3>
            <p className="text-muted-foreground mb-6">Le paiement en espèces a été traité avec succès.</p>
            
            <div className="flex flex-col space-y-3">
              <Button
                variant="default"
                iconName="Printer"
                iconPosition="left"
                onClick={handlePrintReceipt}
                className="w-full"
              >
                Imprimer le Reçu
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseAfterCash}
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Banknote" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Enregistrer un Paiement</h2>
              <p className="text-sm text-muted-foreground">Gestion des frais de scolarité</p>
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

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors?.submit && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error">
              {errors?.submit}
            </div>
          )}

          {/* Student Selection */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Informations de l'Étudiant</h3>
            {studentData ? (
              <div className="p-3 bg-card rounded border">
                <p className="font-medium text-foreground">{studentData?.full_name}</p>
                <p className="text-sm text-muted-foreground">ID: {studentData?.student_id}</p>
              </div>
            ) : (
              <Select
                label="Sélectionner un Étudiant"
                options={students?.map(student => ({
                  value: student?.id,
                  label: `${student?.full_name} (${student?.student_id})`
                })) || []}
                value={paymentData?.studentId}
                onChange={handleStudentSelect}
                placeholder="Choisir un étudiant..."
                error={errors?.studentId}
                required
              />
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Détails du Paiement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Montant (FCFA)"
                type="number"
                step="0.01"
                min="0"
                value={paymentData?.amount}
                onChange={(e) => handleInputChange('amount', e?.target?.value)}
                placeholder="15000"
                error={errors?.amount}
                required
              />
              
              <Select
                label="Méthode de Paiement"
                options={paymentMethods}
                value={paymentData?.paymentMethod}
                onChange={(value) => handleInputChange('paymentMethod', value)}
                placeholder="Sélectionner une méthode"
                error={errors?.paymentMethod}
                required
              />
            </div>

            {/* Cash Payment Specific Fields */}
            {paymentData?.paymentMethod === 'cash' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="Banknote" size={16} className="text-green-600" />
                  <h4 className="text-sm font-semibold text-green-800">Paiement en Espèces</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Espèces Reçues (FCFA)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentData?.cashReceived}
                    onChange={(e) => handleInputChange('cashReceived', e?.target?.value)}
                    placeholder="20000"
                    error={errors?.cashReceived}
                    required
                  />
                  <Input
                    label="Monnaie à Rendre (FCFA)"
                    type="number"
                    value={paymentData?.changeGiven}
                    readOnly
                    className="bg-muted"
                  />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      iconName="Calculator"
                      iconPosition="left"
                      onClick={() => {
                        const exact = paymentData?.amount;
                        if (exact) {
                          handleInputChange('cashReceived', exact);
                        }
                      }}
                      className="w-full"
                    >
                      Montant Exact
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Période (YYYY-MM)"
                type="month"
                value={paymentData?.monthYear}
                onChange={(e) => handleInputChange('monthYear', e?.target?.value)}
                error={errors?.monthYear}
                required
              />
              
              <Input
                label="Date de Paiement"
                type="date"
                value={paymentData?.paymentDate}
                onChange={(e) => handleInputChange('paymentDate', e?.target?.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Input
                label="Référence de Transaction"
                type="text"
                value={paymentData?.transactionRef}
                onChange={(e) => handleInputChange('transactionRef', e?.target?.value)}
                placeholder="Référence automatique"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={generateTransactionRef}
                className="w-full"
              >
                Générer une Référence
              </Button>
            </div>

            <Input
              label="Notes (Optionnel)"
              type="text"
              value={paymentData?.notes}
              onChange={(e) => handleInputChange('notes', e?.target?.value)}
              placeholder="Commentaires additionnels..."
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Receipt" size={16} className="text-primary" />
              <h4 className="text-sm font-semibold text-primary">Résumé du Paiement</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Étudiant:</span>
                <span className="font-medium text-foreground">
                  {paymentData?.studentName || 'Non spécifié'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant:</span>
                <span className="font-medium text-foreground">
                  {paymentData?.amount ? `${paymentData?.amount} FCFA` : '0 FCFA'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Méthode:</span>
                <span className="font-medium text-foreground">
                  {paymentMethods?.find(m => m?.value === paymentData?.paymentMethod)?.label || 'Non sélectionnée'}
                </span>
              </div>
              {paymentData?.paymentMethod === 'cash' && paymentData?.cashReceived && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Espèces reçues:</span>
                    <span className="font-medium text-foreground">{paymentData?.cashReceived} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monnaie:</span>
                    <span className="font-medium text-foreground">{paymentData?.changeGiven} FCFA</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Période:</span>
                <span className="font-medium text-foreground">{paymentData?.monthYear}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isProcessing}
              iconName="Save"
              iconPosition="left"
              disabled={!paymentData?.studentId || !paymentData?.amount || !paymentData?.paymentMethod}
            >
              {isProcessing ? 'Traitement...' : 'Enregistrer Paiement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;