import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const UserFilters = ({ onFiltersChange, totalUsers, filteredUsers }) => {
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    lastLoginFrom: '',
    lastLoginTo: ''
  });

  const roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'administrator', label: 'Administrateur' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'student', label: 'Étudiant' },
    { value: 'parent', label: 'Parent' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'pending', label: 'En attente' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      role: '',
      status: '',
      lastLoginFrom: '',
      lastLoginTo: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtres de recherche</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredUsers}</span> sur {totalUsers} utilisateurs
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
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            type="search"
            placeholder="Rechercher par nom, email..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Role Filter */}
        <Select
          placeholder="Filtrer par rôle"
          options={roleOptions}
          value={filters?.role}
          onChange={(value) => handleFilterChange('role', value)}
        />

        {/* Status Filter */}
        <Select
          placeholder="Filtrer par statut"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        {/* Date Range */}
        <div className="flex space-x-2">
          <Input
            type="date"
            placeholder="Depuis"
            value={filters?.lastLoginFrom}
            onChange={(e) => handleFilterChange('lastLoginFrom', e?.target?.value)}
            className="flex-1"
          />
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtres actifs:</span>
            {filters?.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                Recherche: "{filters?.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
            {filters?.role && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                Rôle: {roleOptions?.find(r => r?.value === filters?.role)?.label}
                <button
                  onClick={() => handleFilterChange('role', '')}
                  className="ml-1 hover:bg-accent/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
            {filters?.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary">
                Statut: {statusOptions?.find(s => s?.value === filters?.status)?.label}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;