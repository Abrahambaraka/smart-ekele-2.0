import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AddStudentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    
    // Academic Information
    class: '',
    section: '',
    academicYear: '2024-2025',
    
    // Parent Information
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelation: 'Mère',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    
    // Fee Information
    feeStructure: 'Standard',
    monthlyFee: 500,
    discount: 0
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const steps = [
    { id: 1, title: 'Informations Personnelles', icon: 'User' },
    { id: 2, title: 'Informations Académiques', icon: 'BookOpen' },
    { id: 3, title: 'Contact Parent', icon: 'Users' },
    { id: 4, title: 'Frais de Scolarité', icon: 'CreditCard' }
  ];

  const classOptions = [
    { value: '6ème A', label: '6ème A' },
    { value: '6ème B', label: '6ème B' },
    { value: '5ème A', label: '5ème A' },
    { value: '5ème B', label: '5ème B' },
    { value: '4ème A', label: '4ème A' },
    { value: '4ème B', label: '4ème B' },
    { value: '3ème A', label: '3ème A' },
    { value: '3ème B', label: '3ème B' },
    { value: '2nde A', label: '2nde A' },
    { value: '2nde B', label: '2nde B' },
    { value: '1ère S', label: '1ère S' },
    { value: '1ère L', label: '1ère L' },
    { value: 'Terminale S', label: 'Terminale S' },
    { value: 'Terminale L', label: 'Terminale L' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData?.firstName?.trim()) newErrors.firstName = 'Prénom requis';
        if (!formData?.lastName?.trim()) newErrors.lastName = 'Nom requis';
        if (!formData?.email?.trim()) newErrors.email = 'Email requis';
        if (!formData?.dateOfBirth) newErrors.dateOfBirth = 'Date de naissance requise';
        break;
      case 2:
        if (!formData?.class) newErrors.class = 'Classe requise';
        break;
      case 3:
        if (!formData?.parentFirstName?.trim()) newErrors.parentFirstName = 'Prénom du parent requis';
        if (!formData?.parentLastName?.trim()) newErrors.parentLastName = 'Nom du parent requis';
        if (!formData?.parentPhone?.trim()) newErrors.parentPhone = 'Téléphone du parent requis';
        break;
      case 4:
        if (!formData?.monthlyFee || formData?.monthlyFee <= 0) newErrors.monthlyFee = 'Frais mensuels requis';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps?.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const studentData = {
        id: Date.now(),
        name: `${formData?.firstName} ${formData?.lastName}`,
        email: formData?.email,
        studentId: `STU${Date.now()?.toString()?.slice(-6)}`,
        class: formData?.class,
        section: formData?.section || 'A',
        status: 'Actif',
        parentName: `${formData?.parentFirstName} ${formData?.parentLastName}`,
        parentPhone: formData?.parentPhone,
        paymentStatus: 'À jour',
        enrollmentDate: new Date()?.toLocaleDateString('fr-FR'),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData?.firstName}${formData?.lastName}`
      };
      
      onSave(studentData);
      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        postalCode: '',
        class: '',
        section: '',
        academicYear: '2024-2025',
        parentFirstName: '',
        parentLastName: '',
        parentPhone: '',
        parentEmail: '',
        parentRelation: 'Mère',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
        feeStructure: 'Standard',
        monthlyFee: 500,
        discount: 0
      });
      setCurrentStep(1);
      setErrors({});
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                type="text"
                value={formData?.firstName}
                onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                error={errors?.firstName}
                required
                placeholder="Entrez le prénom"
              />
              <Input
                label="Nom"
                type="text"
                value={formData?.lastName}
                onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                error={errors?.lastName}
                required
                placeholder="Entrez le nom"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                required
                placeholder="exemple@email.com"
              />
              <Input
                label="Téléphone"
                type="tel"
                value={formData?.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <Input
              label="Date de Naissance"
              type="date"
              value={formData?.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
              error={errors?.dateOfBirth}
              required
            />
            <Input
              label="Adresse"
              type="text"
              value={formData?.address}
              onChange={(e) => handleInputChange('address', e?.target?.value)}
              placeholder="123 Rue de la République"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ville"
                type="text"
                value={formData?.city}
                onChange={(e) => handleInputChange('city', e?.target?.value)}
                placeholder="Paris"
              />
              <Input
                label="Code Postal"
                type="text"
                value={formData?.postalCode}
                onChange={(e) => handleInputChange('postalCode', e?.target?.value)}
                placeholder="75001"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Classe <span className="text-error">*</span>
                </label>
                <select
                  value={formData?.class}
                  onChange={(e) => handleInputChange('class', e?.target?.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors?.class ? 'border-error' : 'border-border'
                  }`}
                >
                  <option value="">Sélectionner une classe</option>
                  {classOptions?.map((option) => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
                {errors?.class && (
                  <p className="text-error text-sm mt-1">{errors?.class}</p>
                )}
              </div>
              
              <Input
                label="Section"
                type="text"
                value={formData?.section}
                onChange={(e) => handleInputChange('section', e?.target?.value)}
                placeholder="A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Année Scolaire
              </label>
              <select
                value={formData?.academicYear}
                onChange={(e) => handleInputChange('academicYear', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground mb-3">Contact Principal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom du Parent"
                type="text"
                value={formData?.parentFirstName}
                onChange={(e) => handleInputChange('parentFirstName', e?.target?.value)}
                error={errors?.parentFirstName}
                required
                placeholder="Prénom"
              />
              <Input
                label="Nom du Parent"
                type="text"
                value={formData?.parentLastName}
                onChange={(e) => handleInputChange('parentLastName', e?.target?.value)}
                error={errors?.parentLastName}
                required
                placeholder="Nom"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Téléphone"
                type="tel"
                value={formData?.parentPhone}
                onChange={(e) => handleInputChange('parentPhone', e?.target?.value)}
                error={errors?.parentPhone}
                required
                placeholder="+33 6 12 34 56 78"
              />
              <Input
                label="Email"
                type="email"
                value={formData?.parentEmail}
                onChange={(e) => handleInputChange('parentEmail', e?.target?.value)}
                placeholder="parent@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Relation
              </label>
              <select
                value={formData?.parentRelation}
                onChange={(e) => handleInputChange('parentRelation', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Mère">Mère</option>
                <option value="Père">Père</option>
                <option value="Tuteur">Tuteur</option>
                <option value="Grand-parent">Grand-parent</option>
              </select>
            </div>
            <h4 className="font-medium text-foreground mb-3 mt-6">Contact d'Urgence</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom Complet"
                type="text"
                value={formData?.emergencyName}
                onChange={(e) => handleInputChange('emergencyName', e?.target?.value)}
                placeholder="Nom complet"
              />
              <Input
                label="Téléphone"
                type="tel"
                value={formData?.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e?.target?.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <Input
              label="Relation"
              type="text"
              value={formData?.emergencyRelation}
              onChange={(e) => handleInputChange('emergencyRelation', e?.target?.value)}
              placeholder="Tante, Oncle, etc."
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Structure Tarifaire
              </label>
              <select
                value={formData?.feeStructure}
                onChange={(e) => handleInputChange('feeStructure', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Standard">Standard</option>
                <option value="Réduit">Réduit</option>
                <option value="Bourse">Bourse</option>
                <option value="Exempté">Exempté</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Frais Mensuels (€)"
                type="number"
                value={formData?.monthlyFee}
                onChange={(e) => handleInputChange('monthlyFee', parseInt(e?.target?.value) || 0)}
                error={errors?.monthlyFee}
                required
                min="0"
              />
              <Input
                label="Remise (%)"
                type="number"
                value={formData?.discount}
                onChange={(e) => handleInputChange('discount', parseInt(e?.target?.value) || 0)}
                min="0"
                max="100"
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Résumé des Frais</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Frais mensuels de base:</span>
                  <span>{formData?.monthlyFee}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Remise ({formData?.discount}%):</span>
                  <span>-{Math.round(formData?.monthlyFee * formData?.discount / 100)}€</span>
                </div>
                <div className="flex justify-between font-medium border-t border-border pt-2">
                  <span>Total mensuel:</span>
                  <span>{Math.round(formData?.monthlyFee * (1 - formData?.discount / 100))}€</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Ajouter un Étudiant</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {steps?.map((step, index) => (
              <div key={step?.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step?.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step?.id ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    step?.id
                  )}
                </div>
                <div className="ml-2 hidden md:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step?.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step?.title}
                  </div>
                </div>
                {index < steps?.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    currentStep > step?.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            iconName="ChevronLeft"
            iconPosition="left"
          >
            Précédent
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Étape {currentStep} sur {steps?.length}
          </div>
          
          {currentStep < steps?.length ? (
            <Button
              onClick={handleNext}
              iconName="ChevronRight"
              iconPosition="right"
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              iconName="Check"
              iconPosition="left"
            >
              Enregistrer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;