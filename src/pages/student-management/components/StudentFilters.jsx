import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const StudentFilters = ({
  searchTerm,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedStatus,
  onStatusChange,
  selectedPaymentStatus,
  onPaymentStatusChange,
  selectedAcademicYear,
  onAcademicYearChange,
  resultCount,
  onClearFilters
}) => {
  const classOptions = [
    { value: '', label: 'Toutes les classes' },
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

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'Actif', label: 'Actif' },
    { value: 'Inactif', label: 'Inactif' },
    { value: 'Suspendu', label: 'Suspendu' },
    { value: 'Diplômé', label: 'Diplômé' }
  ];

  const paymentStatusOptions = [
    { value: '', label: 'Tous les paiements' },
    { value: 'À jour', label: 'À jour' },
    { value: 'En retard', label: 'En retard' },
    { value: 'Partiel', label: 'Partiel' },
    { value: 'Exempté', label: 'Exempté' }
  ];

  const academicYearOptions = [
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' }
  ];

  const hasActiveFilters = searchTerm || selectedClass || selectedStatus || selectedPaymentStatus || selectedAcademicYear !== '2024-2025';

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            type="text"
            placeholder="Rechercher par nom, ID étudiant, email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="pl-10"
          />
        </div>
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Classe
          </label>
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {classOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Statut
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {statusOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Paiement
          </label>
          <select
            value={selectedPaymentStatus}
            onChange={(e) => onPaymentStatusChange(e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {paymentStatusOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Année Scolaire
          </label>
          <select
            value={selectedAcademicYear}
            onChange={(e) => onAcademicYearChange(e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {academicYearOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Results Summary and Clear Filters */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{resultCount}</span> étudiant(s) trouvé(s)
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
              className="text-muted-foreground hover:text-foreground"
            >
              Effacer les filtres
            </Button>
          )}
        </div>

        {/* Quick Filter Badges */}
        <div className="hidden lg:flex items-center space-x-2">
          {selectedClass && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              <span>Classe: {selectedClass}</span>
              <button onClick={() => onClassChange('')}>
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
              <span>Statut: {selectedStatus}</span>
              <button onClick={() => onStatusChange('')}>
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {selectedPaymentStatus && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning rounded-full text-xs">
              <span>Paiement: {selectedPaymentStatus}</span>
              <button onClick={() => onPaymentStatusChange('')}>
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFilters;