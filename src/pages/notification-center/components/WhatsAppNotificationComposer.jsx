import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabaseService } from '../../../services/supabaseService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WhatsAppNotificationComposer = ({ onNotificationSent }) => {
  const { userProfile, isTeacher } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [formData, setFormData] = useState({
    notificationType: 'attendance',
    selectedStudents: [],
    selectedClass: '',
    bulkMode: false,
    title: '',
    message: '',
    attendanceStatus: 'absent',
    behaviorType: 'inappropriate',
    behaviorDescription: '',
    paymentAmount: '',
    paymentDueDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (isTeacher()) {
        // Load classes assigned to this teacher
        const teacherClasses = await supabaseService?.getClassesBySchool(userProfile?.school_id);
        const myClasses = teacherClasses?.filter(cls => cls?.teacher_id === userProfile?.id);
        setClasses(myClasses || []);
        
        // Load all students from teacher's classes
        const allStudents = [];
        for (const cls of myClasses) {
          const classStudents = cls?.enrollments?.map(enrollment => ({
            ...enrollment?.students,
            className: cls?.name,
            classId: cls?.id
          })) || [];
          allStudents?.push(...classStudents);
        }
        setStudents(allStudents);
      } else {
        // School admin can access all students
        const schoolStudents = await supabaseService?.getStudentsBySchool(userProfile?.school_id);
        setStudents(schoolStudents || []);
        
        const schoolClasses = await supabaseService?.getClassesBySchool(userProfile?.school_id);
        setClasses(schoolClasses || []);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate title and message based on notification type
    if (field === 'notificationType') {
      generateNotificationTemplate(value);
    }
  };

  const generateNotificationTemplate = (type) => {
    const templates = {
      attendance: {
        title: 'Notification de Présence',
        message: 'Concerne la présence de votre enfant en classe aujourd\'hui.'
      },
      behavior: {
        title: 'Rapport de Comportement',
        message: 'Nous souhaitons vous informer du comportement de votre enfant en classe.'
      },
      payment: {
        title: 'Rappel de Paiement',
        message: 'Rappel concernant les frais de scolarité de votre enfant.'
      },
      announcement: {
        title: 'Annonce Importante',
        message: 'Nous tenons à vous informer d\'une annonce importante.'
      }
    };

    const template = templates?.[type];
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template?.title,
        message: template?.message
      }));
    }
  };

  const handleStudentSelection = (studentId) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev?.selectedStudents?.includes(studentId)
        ? prev?.selectedStudents?.filter(id => id !== studentId)
        : [...prev?.selectedStudents, studentId]
    }));
  };

  const handleClassSelection = (classId) => {
    const classStudents = students?.filter(student => student?.classId === classId);
    const studentIds = classStudents?.map(s => s?.id);
    
    setFormData(prev => ({
      ...prev,
      selectedClass: classId,
      selectedStudents: studentIds
    }));
  };

  const buildNotificationMessage = (student) => {
    let message = formData?.message;
    
    // Replace placeholders with student data
    message = message?.replace('votre enfant', student?.full_name);
    
    switch (formData?.notificationType) {
      case 'attendance':
        const statusText = {
          absent: 'était absent(e)',
          late: 'est arrivé(e) en retard',
          excused: 'a une absence justifiée'
        }?.[formData?.attendanceStatus] || 'était absent(e)';
        
        message = `${student?.full_name} ${statusText} en classe ${student?.className} aujourd'hui.`;
        break;
        
      case 'behavior':
        const behaviorText = {
          inappropriate: 'comportement inapproprié signalé',excellent: 'excellent comportement observé',warning: 'avertissement donné'
        }?.[formData?.behaviorType] || 'comportement signalé';
        
        message = `${behaviorText} pour ${student?.full_name} en classe ${student?.className}. ${formData?.behaviorDescription}`;
        break;
        
      case 'payment':
        message = `Le paiement mensuel de ${formData?.paymentAmount} FCFA pour ${student?.full_name} est dû le ${new Date(formData?.paymentDueDate)?.toLocaleDateString('fr-FR')}. Merci de régulariser votre situation.`;
        break;
        
      default:
        break;
    }
    
    return message;
  };

  const handleSendNotifications = async () => {
    if (formData?.selectedStudents?.length === 0) {
      setError('Veuillez sélectionner au moins un étudiant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedStudentData = students?.filter(s => formData?.selectedStudents?.includes(s?.id));
      const notifications = [];

      for (const student of selectedStudentData) {
        if (!student?.parent_phone) {
          console.warn(`Pas de numéro WhatsApp pour ${student?.full_name}`);
          continue;
        }

        const notification = {
          type: formData?.notificationType,
          title: formData?.title,
          message: buildNotificationMessage(student),
          parentPhone: student?.parent_phone,
          studentId: student?.id,
          schoolId: userProfile?.school_id
        };

        notifications?.push(notification);
      }

      if (notifications?.length === 0) {
        setError('Aucun étudiant n\'a de numéro WhatsApp valide');
        return;
      }

      // Send bulk notifications
      const results = await supabaseService?.sendBulkWhatsAppNotifications(notifications);
      
      const successCount = results?.filter(r => r?.success)?.length;
      const failureCount = results?.filter(r => !r?.success)?.length;

      if (successCount > 0) {
        onNotificationSent?.({
          success: true,
          message: `${successCount} notification(s) envoyée(s) avec succès`,
          details: { sent: successCount, failed: failureCount }
        });

        // Reset form
        setFormData({
          notificationType: 'attendance',
          selectedStudents: [],
          selectedClass: '',
          bulkMode: false,
          title: '',
          message: '',
          attendanceStatus: 'absent',
          behaviorType: 'inappropriate',
          behaviorDescription: '',
          paymentAmount: '',
          paymentDueDate: ''
        });
      } else {
        setError('Toutes les notifications ont échoué');
      }

    } catch (err) {
      setError('Erreur lors de l\'envoi des notifications');
      console.error('Error sending notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = formData?.selectedClass 
    ? students?.filter(s => s?.classId === formData?.selectedClass)
    : students;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
          <Icon name="MessageCircle" size={20} className="text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Composer Notification WhatsApp</h3>
          <p className="text-sm text-muted-foreground">
            Envoyez des notifications aux parents via WhatsApp
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} />
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-destructive hover:text-destructive/80"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notification Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type de notification
          </label>
          <Select
            value={formData?.notificationType}
            onValueChange={(value) => handleInputChange('notificationType', value)}
          >
            <option value="attendance">Présence/Absence</option>
            <option value="behavior">Comportement</option>
            <option value="payment">Paiement</option>
            <option value="announcement">Annonce générale</option>
          </Select>
        </div>

        {/* Class Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Classe (optionnel)
          </label>
          <Select
            value={formData?.selectedClass}
            onValueChange={(value) => handleClassSelection(value)}
          >
            <option value="">Toutes les classes</option>
            {classes?.map(cls => (
              <option key={cls?.id} value={cls?.id}>
                {cls?.name} - {cls?.level} {cls?.section}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Specific fields based on notification type */}
      {formData?.notificationType === 'attendance' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Statut de présence
          </label>
          <Select
            value={formData?.attendanceStatus}
            onValueChange={(value) => handleInputChange('attendanceStatus', value)}
          >
            <option value="absent">Absent</option>
            <option value="late">En retard</option>
            <option value="excused">Absence justifiée</option>
          </Select>
        </div>
      )}

      {formData?.notificationType === 'behavior' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Type de comportement
            </label>
            <Select
              value={formData?.behaviorType}
              onValueChange={(value) => handleInputChange('behaviorType', value)}
            >
              <option value="inappropriate">Inapproprié</option>
              <option value="warning">Avertissement</option>
              <option value="excellent">Excellent</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Input
              value={formData?.behaviorDescription}
              onChange={(e) => handleInputChange('behaviorDescription', e?.target?.value)}
              placeholder="Décrivez le comportement..."
            />
          </div>
        </div>
      )}

      {formData?.notificationType === 'payment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Montant (FCFA)
            </label>
            <Input
              type="number"
              value={formData?.paymentAmount}
              onChange={(e) => handleInputChange('paymentAmount', e?.target?.value)}
              placeholder="15000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date d'échéance
            </label>
            <Input
              type="date"
              value={formData?.paymentDueDate}
              onChange={(e) => handleInputChange('paymentDueDate', e?.target?.value)}
            />
          </div>
        </div>
      )}

      {/* Message customization */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Titre du message
        </label>
        <Input
          value={formData?.title}
          onChange={(e) => handleInputChange('title', e?.target?.value)}
          placeholder="Titre de la notification"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Message personnalisé
        </label>
        <textarea
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-primary"
          rows="4"
          value={formData?.message}
          onChange={(e) => handleInputChange('message', e?.target?.value)}
          placeholder="Votre message personnalisé..."
        />
      </div>

      {/* Student selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">
            Sélectionnez les étudiants ({formData?.selectedStudents?.length} sélectionné(s))
          </label>
          {filteredStudents?.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allIds = filteredStudents?.map(s => s?.id);
                const allSelected = allIds?.every(id => formData?.selectedStudents?.includes(id));
                setFormData(prev => ({
                  ...prev,
                  selectedStudents: allSelected ? [] : allIds
                }));
              }}
            >
              {filteredStudents?.every(s => formData?.selectedStudents?.includes(s?.id)) ? 'Tout déselectionner' : 'Tout sélectionner'}
            </Button>
          )}
        </div>

        <div className="max-h-60 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
          {filteredStudents?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun étudiant trouvé
            </p>
          ) : (
            filteredStudents?.map(student => (
              <div
                key={student?.id}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  formData?.selectedStudents?.includes(student?.id)
                    ? 'bg-primary/10 border border-primary/20' :'bg-muted/30 hover:bg-muted/50'
                }`}
                onClick={() => handleStudentSelection(student?.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 border-2 rounded ${
                    formData?.selectedStudents?.includes(student?.id)
                      ? 'bg-primary border-primary' :'border-border'
                  }`}>
                    {formData?.selectedStudents?.includes(student?.id) && (
                      <Icon name="Check" size={12} className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{student?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student?.className} • {student?.parent_phone || 'Pas de WhatsApp'}
                    </p>
                  </div>
                </div>
                {!student?.parent_phone && (
                  <Icon name="AlertTriangle" size={16} className="text-warning" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send button */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({
              notificationType: 'attendance',
              selectedStudents: [],
              selectedClass: '',
              bulkMode: false,
              title: '',
              message: '',
              attendanceStatus: 'absent',
              behaviorType: 'inappropriate',
              behaviorDescription: '',
              paymentAmount: '',
              paymentDueDate: ''
            });
            setError(null);
          }}
          disabled={loading}
        >
          Réinitialiser
        </Button>
        <Button
          onClick={handleSendNotifications}
          disabled={loading || formData?.selectedStudents?.length === 0}
          iconName="Send"
          iconPosition="left"
        >
          {loading ? 'Envoi...' : `Envoyer (${formData?.selectedStudents?.length})`}
        </Button>
      </div>
    </div>
  );
};

export default WhatsAppNotificationComposer;