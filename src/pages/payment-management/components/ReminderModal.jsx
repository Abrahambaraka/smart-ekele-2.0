import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ReminderModal = ({ isOpen, onClose, selectedPayments = [] }) => {
  const [reminderData, setReminderData] = useState({
    type: 'email',
    template: 'standard',
    subject: 'Rappel de Paiement - Frais de Scolarité',
    message: `Cher parent,\n\nNous vous rappelons que le paiement des frais de scolarité de votre enfant est en attente.\n\nMerci de procéder au règlement dans les plus brefs délais.\n\nCordialement,\nL'administration de Smart Ekele`,sendImmediately: true,scheduleDate: '',scheduleTime: ''
  });

  const [isSending, setIsSending] = useState(false);

  const reminderTypes = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'both', label: 'Email + SMS' }
  ];

  const templateOptions = [
    { value: 'standard', label: 'Rappel Standard' },
    { value: 'urgent', label: 'Rappel Urgent' },
    { value: 'final', label: 'Dernier Rappel' },
    { value: 'custom', label: 'Message Personnalisé' }
  ];

  const handleInputChange = (field, value) => {
    setReminderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateChange = (template) => {
    const templates = {
      standard: {
        subject: 'Rappel de Paiement - Frais de Scolarité',
        message: `Cher parent,\n\nNous vous rappelons que le paiement des frais de scolarité de votre enfant est en attente.\n\nMerci de procéder au règlement dans les plus brefs délais.\n\nCordialement,\nL'administration de Smart Ekele`
      },
      urgent: {
        subject: 'URGENT - Paiement en Retard',message: `Cher parent,\n\nLe paiement des frais de scolarité de votre enfant est maintenant en retard.\n\nVeuillez régulariser votre situation rapidement pour éviter toute interruption des services.\n\nCordialement,\nL'administration de Smart Ekele`
      },
      final: {
        subject: 'DERNIER RAPPEL - Action Requise',
        message: `Cher parent,\n\nCeci est notre dernier rappel concernant le paiement en retard des frais de scolarité.\n\nSans règlement sous 48h, nous serons contraints de suspendre l'accès aux services.\n\nContactez-nous immédiatement.\n\nL'administration de Smart Ekele`
      },
      custom: {
        subject: '',
        message: ''
      }
    };

    setReminderData(prev => ({
      ...prev,
      template,
      subject: templates?.[template]?.subject,
      message: templates?.[template]?.message
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSending(true);

    // Simulate sending reminders
    setTimeout(() => {
      console.log('Reminders sent:', {
        ...reminderData,
        recipients: selectedPayments
      });
      setIsSending(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Send" size={20} className="text-warning" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Envoyer des Rappels</h2>
              <p className="text-sm text-muted-foreground">
                {selectedPayments?.length} destinataire(s) sélectionné(s)
              </p>
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
          {/* Recipients Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Destinataires</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Users" size={16} />
              <span>{selectedPayments?.length} parent(s) recevront ce rappel</span>
            </div>
          </div>

          {/* Reminder Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Configuration du Rappel</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type de Rappel"
                options={reminderTypes}
                value={reminderData?.type}
                onChange={(value) => handleInputChange('type', value)}
                required
              />
              
              <Select
                label="Modèle de Message"
                options={templateOptions}
                value={reminderData?.template}
                onChange={handleTemplateChange}
                required
              />
            </div>

            {/* Scheduling Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={reminderData?.sendImmediately}
                  onChange={(e) => handleInputChange('sendImmediately', e?.target?.checked)}
                />
                <label className="text-sm font-medium text-foreground">
                  Envoyer immédiatement
                </label>
              </div>

              {!reminderData?.sendImmediately && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <Input
                    label="Date d'Envoi"
                    type="date"
                    value={reminderData?.scheduleDate}
                    onChange={(e) => handleInputChange('scheduleDate', e?.target?.value)}
                    required={!reminderData?.sendImmediately}
                  />
                  <Input
                    label="Heure d'Envoi"
                    type="time"
                    value={reminderData?.scheduleTime}
                    onChange={(e) => handleInputChange('scheduleTime', e?.target?.value)}
                    required={!reminderData?.sendImmediately}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contenu du Message</h3>
            
            <Input
              label="Objet"
              type="text"
              value={reminderData?.subject}
              onChange={(e) => handleInputChange('subject', e?.target?.value)}
              placeholder="Objet du message"
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message</label>
              <textarea
                className="w-full h-32 px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                value={reminderData?.message}
                onChange={(e) => handleInputChange('message', e?.target?.value)}
                placeholder="Contenu du message..."
                required
              />
              <div className="text-xs text-muted-foreground">
                Variables disponibles: {'{nom_etudiant}'}, {'{montant_du}'}, {'{date_echeance}'}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Eye" size={16} className="text-primary" />
              <h4 className="text-sm font-semibold text-primary">Aperçu du Message</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-foreground">Objet:</span>
                <div className="text-muted-foreground mt-1">{reminderData?.subject}</div>
              </div>
              <div>
                <span className="font-medium text-foreground">Message:</span>
                <div className="text-muted-foreground mt-1 whitespace-pre-line">
                  {reminderData?.message}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSending}
              iconName="Send"
              iconPosition="left"
            >
              {isSending ? 'Envoi en cours...' : 'Envoyer Rappels'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;