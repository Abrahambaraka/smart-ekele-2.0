import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CreateClassModal = ({ isOpen, onClose, onCreateClass }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subject: '',
    teacher: '',
    academicYear: '2024-2025',
    capacity: '',
    room: '',
    description: '',
    schedule: {
      days: '',
      startTime: '',
      endTime: '',
      duration: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectOptions = [
    { value: 'mathematiques', label: 'Mathématiques' },
    { value: 'francais', label: 'Français' },
    { value: 'sciences', label: 'Sciences' },
    { value: 'histoire', label: 'Histoire' },
    { value: 'anglais', label: 'Anglais' },
    { value: 'physique', label: 'Physique' },
    { value: 'chimie', label: 'Chimie' },
    { value: 'biologie', label: 'Biologie' },
    { value: 'geographie', label: 'Géographie' },
    { value: 'philosophie', label: 'Philosophie' }
  ];

  const teacherOptions = [
    { value: 'marie-dubois', label: 'Marie Dubois - Mathématiques' },
    { value: 'jean-martin', label: 'Jean Martin - Sciences' },
    { value: 'sophie-bernard', label: 'Sophie Bernard - Français' },
    { value: 'pierre-durand', label: 'Pierre Durand - Histoire' },
    { value: 'claire-moreau', label: 'Claire Moreau - Anglais' },
    { value: 'antoine-rousseau', label: 'Antoine Rousseau - Physique' },
    { value: 'isabelle-petit', label: 'Isabelle Petit - Chimie' }
  ];

  const dayOptions = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' }
  ];

  const yearOptions = [
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2025-2026', label: '2025-2026' }
  ];

  const handleInputChange = (field, value) => {
    if (field?.includes('.')) {
      const [parent, child] = field?.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev?.[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Le nom de la classe est requis';
    }

    if (!formData?.code?.trim()) {
      newErrors.code = 'Le code de la classe est requis';
    }

    if (!formData?.subject) {
      newErrors.subject = 'La matière est requise';
    }

    if (!formData?.teacher) {
      newErrors.teacher = 'L\'enseignant est requis';
    }

    if (!formData?.capacity || formData?.capacity < 1) {
      newErrors.capacity = 'La capacité doit être supérieure à 0';
    }

    if (!formData?.schedule?.days) {
      newErrors['schedule.days'] = 'Les jours sont requis';
    }

    if (!formData?.schedule?.startTime) {
      newErrors['schedule.startTime'] = 'L\'heure de début est requise';
    }

    if (!formData?.schedule?.endTime) {
      newErrors['schedule.endTime'] = 'L\'heure de fin est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newClass = {
        id: Date.now()?.toString(),
        ...formData,
        studentCount: 0,
        status: 'active',
        createdAt: new Date()?.toISOString(),
        teacher: teacherOptions?.find(t => t?.value === formData?.teacher)?.label?.split(' - ')?.[0] || formData?.teacher
      };

      onCreateClass(newClass);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        subject: '',
        teacher: '',
        academicYear: '2024-2025',
        capacity: '',
        room: '',
        description: '',
        schedule: {
          days: '',
          startTime: '',
          endTime: '',
          duration: ''
        }
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Plus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Créer une Nouvelle Classe</h2>
              <p className="text-sm text-muted-foreground">Configurez les détails de la classe</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={handleClose}
            disabled={isSubmitting}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
              <Icon name="Info" size={18} className="text-primary" />
              <span>Informations de Base</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom de la Classe"
                type="text"
                placeholder="Ex: Mathématiques Avancées"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                error={errors?.name}
                required
              />
              
              <Input
                label="Code de la Classe"
                type="text"
                placeholder="Ex: MATH-ADV-2024"
                value={formData?.code}
                onChange={(e) => handleInputChange('code', e?.target?.value)}
                error={errors?.code}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Matière"
                placeholder="Sélectionner une matière"
                options={subjectOptions}
                value={formData?.subject}
                onChange={(value) => handleInputChange('subject', value)}
                error={errors?.subject}
                required
                searchable
              />
              
              <Select
                label="Enseignant Assigné"
                placeholder="Sélectionner un enseignant"
                options={teacherOptions}
                value={formData?.teacher}
                onChange={(value) => handleInputChange('teacher', value)}
                error={errors?.teacher}
                required
                searchable
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Année Académique"
                options={yearOptions}
                value={formData?.academicYear}
                onChange={(value) => handleInputChange('academicYear', value)}
                required
              />
              
              <Input
                label="Capacité Maximum"
                type="number"
                placeholder="Ex: 30"
                value={formData?.capacity}
                onChange={(e) => handleInputChange('capacity', e?.target?.value)}
                error={errors?.capacity}
                min="1"
                max="100"
                required
              />
              
              <Input
                label="Salle de Classe"
                type="text"
                placeholder="Ex: A-101"
                value={formData?.room}
                onChange={(e) => handleInputChange('room', e?.target?.value)}
              />
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
              <Icon name="Calendar" size={18} className="text-primary" />
              <span>Configuration de l'Horaire</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Jour de la Semaine"
                placeholder="Sélectionner un jour"
                options={dayOptions}
                value={formData?.schedule?.days}
                onChange={(value) => handleInputChange('schedule.days', value)}
                error={errors?.['schedule.days']}
                required
              />
              
              <Input
                label="Heure de Début"
                type="time"
                value={formData?.schedule?.startTime}
                onChange={(e) => handleInputChange('schedule.startTime', e?.target?.value)}
                error={errors?.['schedule.startTime']}
                required
              />
              
              <Input
                label="Heure de Fin"
                type="time"
                value={formData?.schedule?.endTime}
                onChange={(e) => handleInputChange('schedule.endTime', e?.target?.value)}
                error={errors?.['schedule.endTime']}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
              <Icon name="FileText" size={18} className="text-primary" />
              <span>Description (Optionnel)</span>
            </h3>
            
            <div className="space-y-2">
              <textarea
                placeholder="Décrivez les objectifs et le contenu de la classe..."
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Décrivez brièvement le contenu et les objectifs de cette classe
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName="Plus"
              iconPosition="left"
            >
              {isSubmitting ? 'Création...' : 'Créer la Classe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;