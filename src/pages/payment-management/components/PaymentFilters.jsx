import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const PaymentFilters = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    class: '',
    amountMin: '',
    amountMax: '',
    searchTerm: ''
  });

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'paid', label: 'Payé' },
    { value: 'pending', label: 'En attente' },
    { value: 'overdue', label: 'En retard' },
    { value: 'partial', label: 'Partiel' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois-ci' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: '6eme-a', label: '6ème A' },
    { value: '6eme-b', label: '6ème B' },
    { value: '5eme-a', label: '5ème A' },
    { value: '5eme-b', label: '5ème B' },
    { value: '4eme-a', label: '4ème A' },
    { value: '3eme-a', label: '3ème A' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      dateRange: '',
      class: '',
      amountMin: '',
      amountMax: '',
      searchTerm: ''
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtres de Recherche</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={clearFilters}
          >
            Effacer
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="xl:col-span-2">
          <Input
            type="search"
            placeholder="Rechercher un étudiant..."
            value={filters?.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <Select
          placeholder="Statut"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        {/* Date Range Filter */}
        <Select
          placeholder="Période"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />

        {/* Class Filter */}
        <Select
          placeholder="Classe"
          options={classOptions}
          value={filters?.class}
          onChange={(value) => handleFilterChange('class', value)}
        />

        {/* Amount Range */}
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Min €"
            value={filters?.amountMin}
            onChange={(e) => handleFilterChange('amountMin', e?.target?.value)}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Max €"
            value={filters?.amountMax}
            onChange={(e) => handleFilterChange('amountMax', e?.target?.value)}
            className="w-full"
          />
        </div>
      </div>
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} />
            <span>
              Filtres actifs: {Object.values(filters)?.filter(v => v !== '')?.length} critère(s)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentFilters;