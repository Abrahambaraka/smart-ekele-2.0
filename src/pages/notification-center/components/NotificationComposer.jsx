import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const NotificationComposer = () => {
  const [composerData, setComposerData] = useState({
    template: '',
    recipients: [],
    subject: '',
    message: '',
    scheduledDate: '',
    scheduledTime: '',
    deliveryMethod: 'email',
    priority: 'normal',
    attachments: []
  });

  const [activeTab, setActiveTab] = useState('compose');
  const [isScheduled, setIsScheduled] = useState(false);
  const [templates, setTemplates] = useState([
    { id: 'payment-reminder', name: 'Rappel de Paiement', category: 'Paiement', usage: 45 },
    { id: 'academic-results', name: 'Résultats Académiques', category: 'Académique', usage: 23 },
    { id: 'event-announcement', name: 'Annonce d\'Événement', category: 'Événement', usage: 67 },
    { id: 'emergency-alert', name: 'Alerte d\'Urgence', category: 'Urgence', usage: 8 }
  ]);
  
  const [drafts, setDrafts] = useState([
    { 
      id: 1, 
      title: 'Rappel Frais Septembre', 
      lastModified: '2025-09-14T10:30:00',
      recipients: ['Parents - 6ème A'],
      isScheduled: false
    },
    { 
      id: 2, 
      title: 'Réunion Trimestrielle', 
      lastModified: '2025-09-13T16:45:00',
      recipients: ['Tous les Parents'],
      isScheduled: true,
      scheduledFor: '2025-09-20T09:00:00'
    }
  ]);

  // Template options
  const templateOptions = [
    { value: '', label: 'Nouveau message' },
    { value: 'payment-reminder', label: 'Rappel de Paiement' },
    { value: 'academic-results', label: 'Résultats Académiques' },
    { value: 'event-announcement', label: 'Annonce d\'Événement' },
    { value: 'emergency-alert', label: 'Alerte d\'Urgence' },
    { value: 'policy-update', label: 'Mise à Jour Politique' },
    { value: 'field-trip', label: 'Sortie Éducative' }
  ];

  // Recipient options
  const recipientOptions = [
    { value: 'all-parents', label: 'Tous les Parents' },
    { value: 'all-students', label: 'Tous les Étudiants' },
    { value: 'all-teachers', label: 'Tous les Enseignants' },
    { value: 'all-staff', label: 'Tout le Personnel' },
    { value: 'class-6a', label: 'Classe 6ème A' },
    { value: 'class-6b', label: 'Classe 6ème B' },
    { value: 'class-5a', label: 'Classe 5ème A' },
    { value: 'class-5b', label: 'Classe 5ème B' },
    { value: 'class-4a', label: 'Classe 4ème A' },
    { value: 'class-3a', label: 'Classe 3ème A' }
  ];

  const deliveryMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'both', label: 'Email + SMS' },
    { value: 'app', label: 'Notification App' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Élevé' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleTemplateChange = (templateId) => {
    setComposerData(prev => ({ ...prev, template: templateId }));
    
    // Load template content
    const templates = {
      'payment-reminder': {
        subject: 'Rappel de Paiement - Frais de Scolarité',
        message: `Cher(e) Parent,\n\nNous vous rappelons que les frais de scolarité pour le mois de [MOIS] sont dus.\n\nMontant: [MONTANT] EUR\nDate limite: [DATE_LIMITE]\n\nVeuillez effectuer le paiement dans les plus brefs délais.\n\nCordialement,\nL'Administration Smart Ekele`
      },
      'academic-results': {
        subject: 'Résultats Académiques - [PERIODE]',
        message: `Cher(e) Parent,\n\nLes résultats académiques de votre enfant [NOM_ETUDIANT] pour la période [PERIODE] sont maintenant disponibles.\n\nVous pouvez consulter le bulletin détaillé dans votre espace parent.\n\nCordialement,\nL'Équipe Pédagogique`
      }
    };

    if (templates?.[templateId]) {
      setComposerData(prev => ({
        ...prev,
        subject: templates?.[templateId]?.subject,
        message: templates?.[templateId]?.message
      }));
    }
  };

  const handleFileUpload = (files) => {
    const newAttachments = Array.from(files)?.map(file => ({
      id: Date.now() + Math.random(),
      name: file?.name,
      size: file?.size,
      type: file?.type,
      file: file
    }));
    
    setComposerData(prev => ({
      ...prev,
      attachments: [...prev?.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (attachmentId) => {
    setComposerData(prev => ({
      ...prev,
      attachments: prev?.attachments?.filter(att => att?.id !== attachmentId)
    }));
  };

  const handleSend = () => {
    console.log('Sending notification:', composerData);
    // Reset form
    setComposerData({
      template: '',
      recipients: [],
      subject: '',
      message: '',
      scheduledDate: '',
      scheduledTime: '',
      deliveryMethod: 'email',
      priority: 'normal',
      attachments: []
    });
    alert('Message envoyé avec succès !');
  };

  const handleSaveDraft = () => {
    const newDraft = {
      id: Date.now(),
      title: composerData?.subject || 'Brouillon sans titre',
      lastModified: new Date()?.toISOString(),
      recipients: composerData?.recipients,
      isScheduled: isScheduled,
      scheduledFor: isScheduled ? `${composerData?.scheduledDate}T${composerData?.scheduledTime}:00` : null,
      data: composerData
    };
    
    setDrafts(prev => [newDraft, ...prev]);
    alert('Brouillon sauvegardé !');
  };

  const handleLoadDraft = (draft) => {
    setComposerData(draft?.data || {
      template: '',
      recipients: draft?.recipients || [],
      subject: draft?.title || '',
      message: '',
      scheduledDate: '',
      scheduledTime: '',
      deliveryMethod: 'email',
      priority: 'normal',
      attachments: []
    });
    setIsScheduled(draft?.isScheduled || false);
    setActiveTab('compose');
  };

  const handleDeleteDraft = (draftId) => {
    setDrafts(prev => prev?.filter(d => d?.id !== draftId));
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'compose', label: 'Composer', icon: 'Edit3' },
    { id: 'templates', label: 'Modèles', icon: 'FileText' },
    { id: 'drafts', label: 'Brouillons', icon: 'Save' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab?.id
                  ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
              {tab?.id === 'drafts' && drafts?.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {drafts?.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'compose' && (
          <div className="p-6 space-y-6">
            {/* Template Selection */}
            <div>
              <Select
                label="Modèle de Message"
                options={templateOptions}
                value={composerData?.template}
                onChange={handleTemplateChange}
                placeholder="Choisir un modèle..."
              />
            </div>

            {/* Recipients */}
            <div>
              <Select
                label="Destinataires"
                description="Sélectionnez les groupes de destinataires"
                options={recipientOptions}
                value={composerData?.recipients}
                onChange={(value) => setComposerData(prev => ({ ...prev, recipients: value }))}
                multiple
                searchable
                placeholder="Sélectionner les destinataires..."
                required
              />
            </div>

            {/* Subject */}
            <div>
              <Input
                label="Objet"
                type="text"
                value={composerData?.subject}
                onChange={(e) => setComposerData(prev => ({ ...prev, subject: e?.target?.value }))}
                placeholder="Saisissez l'objet du message..."
                required
              />
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message *
              </label>
              <textarea
                value={composerData?.message}
                onChange={(e) => setComposerData(prev => ({ ...prev, message: e?.target?.value }))}
                placeholder="Rédigez votre message..."
                rows={8}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                required
              />
              <div className="text-xs text-muted-foreground mt-1">
                Variables disponibles: [NOM_ETUDIANT], [CLASSE], [MOIS], [MONTANT], [DATE_LIMITE]
              </div>
            </div>

            {/* Delivery Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Méthode de Livraison"
                options={deliveryMethodOptions}
                value={composerData?.deliveryMethod}
                onChange={(value) => setComposerData(prev => ({ ...prev, deliveryMethod: value }))}
              />

              <Select
                label="Priorité"
                options={priorityOptions}
                value={composerData?.priority}
                onChange={(value) => setComposerData(prev => ({ ...prev, priority: value }))}
              />
            </div>

            {/* Scheduling */}
            <div>
              <Checkbox
                label="Programmer l'envoi"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e?.target?.checked)}
              />
              
              {isScheduled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Date d'envoi"
                    type="date"
                    value={composerData?.scheduledDate}
                    onChange={(e) => setComposerData(prev => ({ ...prev, scheduledDate: e?.target?.value }))}
                  />
                  <Input
                    label="Heure d'envoi"
                    type="time"
                    value={composerData?.scheduledTime}
                    onChange={(e) => setComposerData(prev => ({ ...prev, scheduledTime: e?.target?.value }))}
                  />
                </div>
              )}
            </div>

            {/* Attachments with actual file upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Pièces Jointes
              </label>
              
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center relative"
                onDrop={(e) => {
                  e?.preventDefault();
                  handleFileUpload(e?.dataTransfer?.files);
                }}
                onDragOver={(e) => e?.preventDefault()}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e?.target?.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Icon name="Upload" size={24} className="text-muted-foreground mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">
                  Glissez-déposez vos fichiers ici ou cliquez pour parcourir
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, JPG jusqu'à 10MB
                </div>
              </div>

              {/* Display uploaded attachments */}
              {composerData?.attachments?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {composerData?.attachments?.map((attachment) => (
                    <div key={attachment?.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon name="Paperclip" size={16} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{attachment?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(attachment?.size / 1024)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(attachment?.id)}
                        className="text-error hover:text-error/80"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Modèles de Messages
                </h3>
                <Button variant="default" iconName="Plus">
                  Créer un Modèle
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates?.map((template) => (
                  <div key={template?.id} className="bg-muted/50 border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{template?.name}</h4>
                        <p className="text-sm text-muted-foreground">{template?.category}</p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {template?.usage} utilisations
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Edit3"
                        onClick={() => {
                          handleTemplateChange(template?.id);
                          setActiveTab('compose');
                        }}
                      >
                        Utiliser
                      </Button>
                      <Button variant="ghost" size="sm" iconName="Edit2">
                        Modifier
                      </Button>
                      <Button variant="ghost" size="sm" iconName="Copy">
                        Dupliquer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Brouillons Sauvegardés
                </h3>
                <span className="text-sm text-muted-foreground">
                  {drafts?.length} brouillon(s)
                </span>
              </div>

              {drafts?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Save" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Aucun brouillon
                  </h3>
                  <p className="text-muted-foreground">
                    Vos brouillons sauvegardés apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {drafts?.map((draft) => (
                    <div key={draft?.id} className="bg-muted/50 border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{draft?.title}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Modifié le: {formatDate(draft?.lastModified)}</div>
                            <div>Destinataires: {draft?.recipients?.join(', ') || 'Non spécifiés'}</div>
                            {draft?.isScheduled && draft?.scheduledFor && (
                              <div className="flex items-center space-x-1 text-warning">
                                <Icon name="Clock" size={12} />
                                <span>Programmé pour le {formatDate(draft?.scheduledFor)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Edit3"
                            onClick={() => handleLoadDraft(draft)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Trash2"
                            onClick={() => handleDeleteDraft(draft?.id)}
                          >
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Footer Actions */}
      {activeTab === 'compose' && (
        <div className="border-t border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Users" size={16} />
              <span>
                {composerData?.recipients?.length > 0 
                  ? `${composerData?.recipients?.length} groupe(s) sélectionné(s)`
                  : 'Aucun destinataire sélectionné'
                }
              </span>
              {composerData?.attachments?.length > 0 && (
                <>
                  <span>•</span>
                  <Icon name="Paperclip" size={16} />
                  <span>{composerData?.attachments?.length} pièce(s) jointe(s)</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleSaveDraft} iconName="Save">
                Sauvegarder
              </Button>
              <Button 
                variant="default" 
                onClick={handleSend}
                iconName={isScheduled ? "Clock" : "Send"}
                disabled={!composerData?.subject || !composerData?.message || composerData?.recipients?.length === 0}
              >
                {isScheduled ? 'Programmer' : 'Envoyer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComposer;