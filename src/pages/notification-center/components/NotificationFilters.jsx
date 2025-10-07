import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const NotificationFilters = ({ onFiltersChange, messageCount = 0 }) => {
  const [filters, setFilters] = useState({
    recipientType: '',
    dateRange: 'all',
    status: '',
    category: '',
    searchTerm: ''
  });

  const recipientTypeOptions = [
    { value: '', label: 'Tous les destinataires' },
    { value: 'parents', label: 'Parents' },
    { value: 'students', label: 'Étudiants' },
    { value: 'teachers', label: 'Enseignants' },
    { value: 'staff', label: 'Personnel' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: "Aujourd\'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'sent', label: 'Envoyé' },
    { value: 'delivered', label: 'Livré' },
    { value: 'read', label: 'Lu' },
    { value: 'failed', label: 'Échec' },
    { value: 'scheduled', label: 'Programmé' }
  ];

  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'academic', label: 'Académique' },
    { value: 'payment', label: 'Paiement' },
    { value: 'event', label: 'Événement' },
    { value: 'emergency', label: 'Urgence' },
    { value: 'general', label: 'Général' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      recipientType: '',
      dateRange: 'all',
      status: '',
      category: '',
      searchTerm: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value !== '' && value !== 'all'
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtres</h3>
          <div className="bg-muted px-2 py-1 rounded-full">
            <span className="text-xs font-medium text-muted-foreground">
              {messageCount} messages
            </span>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            iconName="X"
            iconPosition="left"
          >
            Effacer
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            type="search"
            placeholder="Rechercher par titre ou contenu..."
            value={filters?.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Recipient Type */}
        <Select
          options={recipientTypeOptions}
          value={filters?.recipientType}
          onChange={(value) => handleFilterChange('recipientType', value)}
          placeholder="Type de destinataire"
        />

        {/* Date Range */}
        <Select
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          placeholder="Période"
        />

        {/* Status */}
        <Select
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="Statut"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* Category */}
        <Select
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => handleFilterChange('category', value)}
          placeholder="Catégorie"
        />

        {/* Quick Stats */}
        <div className="lg:col-span-2 flex items-center justify-end space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Livrés: 156</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span>En attente: 23</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-error rounded-full"></div>
            <span>Échecs: 4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;