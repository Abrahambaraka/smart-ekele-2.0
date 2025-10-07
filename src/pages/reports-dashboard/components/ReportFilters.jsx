import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ReportFilters = ({ onFiltersChange, onReset }) => {
  const [filters, setFilters] = useState({
    dateRange: 'last_month',
    startDate: '',
    endDate: '',
    classId: '',
    studentGroup: '',
    reportType: '',
    customParameter: ''
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const dateRangeOptions = [
    { value: 'today', label: "Aujourd\'hui" },
    { value: 'this_week', label: 'Cette semaine' },
    { value: 'last_week', label: 'Semaine dernière' },
    { value: 'this_month', label: 'Ce mois' },
    { value: 'last_month', label: 'Mois dernier' },
    { value: 'this_quarter', label: 'Ce trimestre' },
    { value: 'this_year', label: 'Cette année' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: 'cp1', label: 'CP1 - Cours Préparatoire 1' },
    { value: 'cp2', label: 'CP2 - Cours Préparatoire 2' },
    { value: 'ce1', label: 'CE1 - Cours Élémentaire 1' },
    { value: 'ce2', label: 'CE2 - Cours Élémentaire 2' },
    { value: 'cm1', label: 'CM1 - Cours Moyen 1' },
    { value: 'cm2', label: 'CM2 - Cours Moyen 2' }
  ];

  const studentGroupOptions = [
    { value: '', label: 'Tous les groupes' },
    { value: 'excellent', label: 'Excellents (≥16/20)' },
    { value: 'good', label: 'Bons (12-15/20)' },
    { value: 'average', label: 'Moyens (10-11/20)' },
    { value: 'needs_help', label: 'En difficulté (<10/20)' },
    { value: 'new_students', label: 'Nouveaux étudiants' },
    { value: 'repeating', label: 'Redoublants' }
  ];

  const reportTypeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'academic', label: 'Performance académique' },
    { value: 'attendance', label: 'Présence' },
    { value: 'financial', label: 'Financier' },
    { value: 'enrollment', label: 'Inscriptions' },
    { value: 'administrative', label: 'Administratif' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: 'last_month',
      startDate: '',
      endDate: '',
      classId: '',
      studentGroup: '',
      reportType: '',
      customParameter: ''
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filtres de rapport</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="RotateCcw"
            onClick={handleReset}
          >
            Réinitialiser
          </Button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-muted transition-micro"
          >
            <Icon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
        </div>
      </div>
      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Date Range */}
          <div>
            <Select
              label="Période"
              options={dateRangeOptions}
              value={filters?.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              className="mb-3"
            />
            
            {filters?.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date de début"
                  type="date"
                  value={filters?.startDate}
                  onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
                />
                <Input
                  label="Date de fin"
                  type="date"
                  value={filters?.endDate}
                  onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
                />
              </div>
            )}
          </div>

          {/* Class Filter */}
          <Select
            label="Classe"
            options={classOptions}
            value={filters?.classId}
            onChange={(value) => handleFilterChange('classId', value)}
            searchable
          />

          {/* Student Group Filter */}
          <Select
            label="Groupe d'étudiants"
            options={studentGroupOptions}
            value={filters?.studentGroup}
            onChange={(value) => handleFilterChange('studentGroup', value)}
          />

          {/* Report Type Filter */}
          <Select
            label="Type de rapport"
            options={reportTypeOptions}
            value={filters?.reportType}
            onChange={(value) => handleFilterChange('reportType', value)}
          />

          {/* Custom Parameter */}
          <Input
            label="Paramètre personnalisé"
            type="text"
            placeholder="Recherche avancée..."
            value={filters?.customParameter}
            onChange={(e) => handleFilterChange('customParameter', e?.target?.value)}
            description="Filtrage par nom, matière, ou critère spécifique"
          />

          {/* Quick Filters */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Filtres rapides
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'this_week', label: 'Cette semaine' },
                { key: 'excellent', label: 'Excellents' },
                { key: 'needs_help', label: 'En difficulté' },
                { key: 'new_students', label: 'Nouveaux' }
              ]?.map((quickFilter) => (
                <button
                  key={quickFilter?.key}
                  onClick={() => {
                    if (quickFilter?.key?.includes('week') || quickFilter?.key?.includes('month')) {
                      handleFilterChange('dateRange', quickFilter?.key);
                    } else {
                      handleFilterChange('studentGroup', quickFilter?.key);
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground rounded-full transition-micro"
                >
                  {quickFilter?.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Summary */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground">
          Filtres actifs: {Object.values(filters)?.filter(Boolean)?.length} / {Object.keys(filters)?.length}
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;