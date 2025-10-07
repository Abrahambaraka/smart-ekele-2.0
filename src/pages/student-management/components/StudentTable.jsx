import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const StudentTable = ({ 
  students, 
  onViewProfile, 
  onEditStudent, 
  onDeleteStudent,
  onViewAcademicRecord,
  onViewAttendance,
  onViewPayments,
  onContactParent,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  sortConfig,
  onSort
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Actif': { bg: 'bg-success/10', text: 'text-success', icon: 'CheckCircle' },
      'Inactif': { bg: 'bg-error/10', text: 'text-error', icon: 'XCircle' },
      'Suspendu': { bg: 'bg-warning/10', text: 'text-warning', icon: 'AlertCircle' },
      'Diplômé': { bg: 'bg-accent/10', text: 'text-accent', icon: 'GraduationCap' }
    };

    const config = statusConfig?.[status] || statusConfig?.['Actif'];
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        <Icon name={config?.icon} size={12} />
        <span>{status}</span>
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'À jour': { bg: 'bg-success/10', text: 'text-success', icon: 'CheckCircle' },
      'En retard': { bg: 'bg-error/10', text: 'text-error', icon: 'AlertTriangle' },
      'Partiel': { bg: 'bg-warning/10', text: 'text-warning', icon: 'Clock' },
      'Exempté': { bg: 'bg-muted', text: 'text-muted-foreground', icon: 'Shield' }
    };

    const config = statusConfig?.[status] || statusConfig?.['À jour'];
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        <Icon name={config?.icon} size={12} />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedStudents?.length === students?.length && students?.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-border"
                />
              </th>
              {[
                { key: 'name', label: 'Étudiant' },
                { key: 'studentId', label: 'ID Étudiant' },
                { key: 'class', label: 'Classe' },
                { key: 'status', label: 'Statut' },
                { key: 'parentContact', label: 'Contact Parent' },
                { key: 'paymentStatus', label: 'Paiement' },
                { key: 'enrollmentDate', label: 'Inscription' }
              ]?.map((column) => (
                <th key={column?.key} className="px-4 py-3 text-left">
                  <button
                    onClick={() => onSort(column?.key)}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-micro"
                  >
                    <span>{column?.label}</span>
                    <Icon name={getSortIcon(column?.key)} size={14} />
                  </button>
                </th>
              ))}
              <th className="w-32 px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students?.map((student) => (
              <tr
                key={student?.id}
                className={`border-b border-border hover:bg-muted/30 transition-micro ${
                  selectedStudents?.includes(student?.id) ? 'bg-primary/5' : ''
                }`}
                onMouseEnter={() => setHoveredRow(student?.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents?.includes(student?.id)}
                    onChange={() => onSelectStudent(student?.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={student?.avatar}
                        alt={student?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{student?.name}</div>
                      <div className="text-sm text-muted-foreground">{student?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {student?.studentId}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-foreground">{student?.class}</div>
                    <div className="text-sm text-muted-foreground">{student?.section}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(student?.status)}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-foreground">{student?.parentName}</div>
                    <div className="text-sm text-muted-foreground">{student?.parentPhone}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getPaymentStatusBadge(student?.paymentStatus)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {student?.enrollmentDate}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewProfile(student)}
                      className="h-8 w-8"
                      title="Voir le profil"
                    >
                      <Icon name="Eye" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewAcademicRecord(student)}
                      className="h-8 w-8"
                      title="Dossier académique"
                    >
                      <Icon name="BookOpen" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewPayments(student)}
                      className="h-8 w-8"
                      title="Paiements"
                    >
                      <Icon name="CreditCard" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditStudent(student)}
                      className="h-8 w-8"
                      title="Modifier"
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {students?.map((student) => (
          <div
            key={student?.id}
            className={`bg-card border border-border rounded-lg p-4 ${
              selectedStudents?.includes(student?.id) ? 'ring-2 ring-primary/20' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedStudents?.includes(student?.id)}
                  onChange={() => onSelectStudent(student?.id)}
                  className="rounded border-border mt-1"
                />
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={student?.avatar}
                    alt={student?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-foreground">{student?.name}</div>
                  <div className="text-sm text-muted-foreground">{student?.studentId}</div>
                </div>
              </div>
              {getStatusBadge(student?.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <div className="text-muted-foreground">Classe</div>
                <div className="font-medium">{student?.class} - {student?.section}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Paiement</div>
                {getPaymentStatusBadge(student?.paymentStatus)}
              </div>
              <div>
                <div className="text-muted-foreground">Parent</div>
                <div className="font-medium">{student?.parentName}</div>
                <div className="text-xs text-muted-foreground">{student?.parentPhone}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Inscription</div>
                <div className="font-medium">{student?.enrollmentDate}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(student)}
                iconName="Eye"
                iconPosition="left"
              >
                Profil
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewAcademicRecord(student)}
                  className="h-8 w-8"
                  title="Dossier académique"
                >
                  <Icon name="BookOpen" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewPayments(student)}
                  className="h-8 w-8"
                  title="Paiements"
                >
                  <Icon name="CreditCard" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditStudent(student)}
                  className="h-8 w-8"
                  title="Modifier"
                >
                  <Icon name="Edit" size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {students?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun étudiant trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Aucun étudiant ne correspond aux critères de recherche actuels.
          </p>
          <Button variant="outline" onClick={() => window.location?.reload()}>
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentTable;