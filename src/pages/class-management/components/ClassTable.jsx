import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ClassTable = ({ 
  classes, 
  onEditClass, 
  onManageEnrollment, 
  onViewRoster, 
  onViewAttendance,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const subjectOptions = [
    { value: '', label: 'Tous les sujets' },
    { value: 'mathematiques', label: 'Mathématiques' },
    { value: 'francais', label: 'Français' },
    { value: 'sciences', label: 'Sciences' },
    { value: 'histoire', label: 'Histoire' },
    { value: 'anglais', label: 'Anglais' },
    { value: 'physique', label: 'Physique' },
    { value: 'chimie', label: 'Chimie' }
  ];

  const teacherOptions = [
    { value: '', label: 'Tous les enseignants' },
    { value: 'marie-dubois', label: 'Marie Dubois' },
    { value: 'jean-martin', label: 'Jean Martin' },
    { value: 'sophie-bernard', label: 'Sophie Bernard' },
    { value: 'pierre-durand', label: 'Pierre Durand' },
    { value: 'claire-moreau', label: 'Claire Moreau' }
  ];

  const yearOptions = [
    { value: '', label: 'Toutes les années' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'full', label: 'Complet' },
    { value: 'pending', label: 'En attente' }
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredClasses = useMemo(() => {
    let filteredClasses = classes?.filter(classItem => {
      const matchesSearch = classItem?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           classItem?.subject?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           classItem?.teacher?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      const matchesSubject = !filters?.subject || classItem?.subject === filters?.subject;
      const matchesTeacher = !filters?.teacher || classItem?.teacherId === filters?.teacher;
      const matchesYear = !filters?.year || classItem?.academicYear === filters?.year;
      const matchesStatus = !filters?.status || classItem?.status === filters?.status;

      return matchesSearch && matchesSubject && matchesTeacher && matchesYear && matchesStatus;
    });

    if (sortConfig?.key) {
      filteredClasses?.sort((a, b) => {
        if (a?.[sortConfig?.key] < b?.[sortConfig?.key]) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (a?.[sortConfig?.key] > b?.[sortConfig?.key]) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredClasses;
  }, [classes, searchTerm, filters, sortConfig]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Actif', className: 'bg-success/10 text-success border-success/20' },
      inactive: { label: 'Inactif', className: 'bg-muted text-muted-foreground border-border' },
      full: { label: 'Complet', className: 'bg-warning/10 text-warning border-warning/20' },
      pending: { label: 'En attente', className: 'bg-primary/10 text-primary border-primary/20' }
    };

    const config = statusConfig?.[status] || statusConfig?.inactive;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <Input
              type="search"
              placeholder="Rechercher des classes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="w-full"
            />
          </div>
          
          <Select
            placeholder="Filtrer par sujet"
            options={subjectOptions}
            value={filters?.subject}
            onChange={(value) => onFilterChange('subject', value)}
          />
          
          <Select
            placeholder="Filtrer par enseignant"
            options={teacherOptions}
            value={filters?.teacher}
            onChange={(value) => onFilterChange('teacher', value)}
          />
          
          <Select
            placeholder="Année académique"
            options={yearOptions}
            value={filters?.year}
            onChange={(value) => onFilterChange('year', value)}
          />
          
          <Select
            placeholder="Statut"
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => onFilterChange('status', value)}
          />
        </div>
        
        <div className="mt-3 text-sm text-muted-foreground">
          {sortedAndFilteredClasses?.length} classe(s) trouvée(s)
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-2 text-sm font-semibold text-foreground hover:text-primary transition-micro"
                  >
                    <span>Nom de la Classe</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('subject')}
                    className="flex items-center space-x-2 text-sm font-semibold text-foreground hover:text-primary transition-micro"
                  >
                    <span>Matière</span>
                    {getSortIcon('subject')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('teacher')}
                    className="flex items-center space-x-2 text-sm font-semibold text-foreground hover:text-primary transition-micro"
                  >
                    <span>Enseignant</span>
                    {getSortIcon('teacher')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('studentCount')}
                    className="flex items-center space-x-2 text-sm font-semibold text-foreground hover:text-primary transition-micro"
                  >
                    <span>Étudiants</span>
                    {getSortIcon('studentCount')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <span className="text-sm font-semibold text-foreground">Horaire</span>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-2 text-sm font-semibold text-foreground hover:text-primary transition-micro"
                  >
                    <span>Statut</span>
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="text-right p-4">
                  <span className="text-sm font-semibold text-foreground">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredClasses?.map((classItem) => (
                <tr key={classItem?.id} className="border-b border-border hover:bg-muted/30 transition-micro">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{classItem?.name}</div>
                      <div className="text-sm text-muted-foreground">{classItem?.code}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="BookOpen" size={16} className="text-primary" />
                      <span className="text-sm text-foreground">{classItem?.subject}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">{classItem?.teacher}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">
                        {classItem?.studentCount}/{classItem?.capacity}
                      </span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(classItem?.studentCount / classItem?.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">
                      <div>{classItem?.schedule?.days}</div>
                      <div className="text-muted-foreground">{classItem?.schedule?.time}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(classItem?.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Edit"
                        onClick={() => onEditClass(classItem)}
                        className="text-muted-foreground hover:text-foreground"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Users"
                        onClick={() => onManageEnrollment(classItem)}
                        className="text-muted-foreground hover:text-foreground"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="List"
                        onClick={() => onViewRoster(classItem)}
                        className="text-muted-foreground hover:text-foreground"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Calendar"
                        onClick={() => onViewAttendance(classItem)}
                        className="text-muted-foreground hover:text-foreground"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {sortedAndFilteredClasses?.map((classItem) => (
          <div key={classItem?.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{classItem?.name}</h3>
                <p className="text-sm text-muted-foreground">{classItem?.code}</p>
              </div>
              {getStatusBadge(classItem?.status)}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <Icon name="BookOpen" size={16} className="text-primary" />
                <span className="text-sm text-foreground">{classItem?.subject}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="User" size={16} className="text-primary" />
                <span className="text-sm text-foreground">{classItem?.teacher}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={16} className="text-primary" />
                <span className="text-sm text-foreground">
                  {classItem?.studentCount}/{classItem?.capacity} étudiants
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} className="text-primary" />
                <span className="text-sm text-foreground">
                  {classItem?.schedule?.days} - {classItem?.schedule?.time}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(classItem?.studentCount / classItem?.capacity) * 100}%` }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Edit"
                  onClick={() => onEditClass(classItem)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Users"
                  onClick={() => onManageEnrollment(classItem)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="MoreVertical"
                  onClick={() => onViewRoster(classItem)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {sortedAndFilteredClasses?.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Icon name="BookOpen" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune classe trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Aucune classe ne correspond à vos critères de recherche.
          </p>
          <Button variant="outline" onClick={() => {
            onSearchChange('');
            onFilterChange('subject', '');
            onFilterChange('teacher', '');
            onFilterChange('year', '');
            onFilterChange('status', '');
          }}>
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClassTable;