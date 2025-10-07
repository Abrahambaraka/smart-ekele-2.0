import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const EnrollmentModal = ({ isOpen, onClose, selectedClass, onUpdateEnrollment }) => {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock enrolled students data
  const enrolledStudents = [
    {
      id: '1',
      name: 'Sophie Martin',
      email: 'sophie.martin@email.com',
      studentId: 'STU-2024-001',
      enrollmentDate: '2024-09-01',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      id: '2',
      name: 'Lucas Dubois',
      email: 'lucas.dubois@email.com',
      studentId: 'STU-2024-002',
      enrollmentDate: '2024-09-01',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      id: '3',
      name: 'Emma Bernard',
      email: 'emma.bernard@email.com',
      studentId: 'STU-2024-003',
      enrollmentDate: '2024-09-02',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
    },
    {
      id: '4',
      name: 'Thomas Moreau',
      email: 'thomas.moreau@email.com',
      studentId: 'STU-2024-004',
      enrollmentDate: '2024-09-03',
      status: 'pending',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
    }
  ];

  // Mock available students data
  const availableStudents = [
    {
      id: '5',
      name: 'Marie Leroy',
      email: 'marie.leroy@email.com',
      studentId: 'STU-2024-005',
      grade: 'Terminale',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/women/5.jpg'
    },
    {
      id: '6',
      name: 'Antoine Petit',
      email: 'antoine.petit@email.com',
      studentId: 'STU-2024-006',
      grade: 'Première',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/men/6.jpg'
    },
    {
      id: '7',
      name: 'Camille Rousseau',
      email: 'camille.rousseau@email.com',
      studentId: 'STU-2024-007',
      grade: 'Terminale',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/women/7.jpg'
    },
    {
      id: '8',
      name: 'Hugo Garcia',
      email: 'hugo.garcia@email.com',
      studentId: 'STU-2024-008',
      grade: 'Première',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/men/8.jpg'
    }
  ];

  const tabs = [
    { id: 'enrolled', label: 'Étudiants Inscrits', count: enrolledStudents?.length },
    { id: 'available', label: 'Étudiants Disponibles', count: availableStudents?.length }
  ];

  const currentStudents = activeTab === 'enrolled' ? enrolledStudents : availableStudents;

  const filteredStudents = useMemo(() => {
    return currentStudents?.filter(student =>
      student?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      student?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      student?.studentId?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
  }, [currentStudents, searchTerm]);

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev?.includes(studentId) 
        ? prev?.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents?.length === filteredStudents?.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents?.map(student => student?.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedStudents?.length === 0) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`${action} action for students:`, selectedStudents);
      onUpdateEnrollment(selectedStudents, action);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Actif', className: 'bg-success/10 text-success border-success/20' },
      pending: { label: 'En attente', className: 'bg-warning/10 text-warning border-warning/20' },
      inactive: { label: 'Inactif', className: 'bg-muted text-muted-foreground border-border' }
    };

    const config = statusConfig?.[status] || statusConfig?.inactive;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  if (!isOpen || !selectedClass) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Gestion des Inscriptions</h2>
              <p className="text-sm text-muted-foreground">
                {selectedClass?.name} - {selectedClass?.subject}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-micro ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab?.label}
                <span className="ml-2 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                  {tab?.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search and Actions */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 max-w-md">
                <Input
                  type="search"
                  placeholder="Rechercher des étudiants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                />
              </div>
              
              {selectedStudents?.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedStudents?.length} sélectionné(s)
                  </span>
                  {activeTab === 'enrolled' ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      iconName="UserMinus"
                      onClick={() => handleBulkAction('remove')}
                      loading={isLoading}
                    >
                      Désinscrire
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      iconName="UserPlus"
                      onClick={() => handleBulkAction('add')}
                      loading={isLoading}
                    >
                      Inscrire
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Bulk Select */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedStudents?.length === filteredStudents?.length && filteredStudents?.length > 0}
                indeterminate={selectedStudents?.length > 0 && selectedStudents?.length < filteredStudents?.length}
                onChange={handleSelectAll}
                label="Sélectionner tout"
              />
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {filteredStudents?.map((student) => (
                <div
                  key={student?.id}
                  className={`flex items-center space-x-4 p-4 border border-border rounded-lg transition-micro hover:bg-muted/30 ${
                    selectedStudents?.includes(student?.id) ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  <Checkbox
                    checked={selectedStudents?.includes(student?.id)}
                    onChange={() => handleStudentSelect(student?.id)}
                  />
                  
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={student?.avatar}
                      alt={student?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-foreground">{student?.name}</h4>
                      {getStatusBadge(student?.status)}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-muted-foreground">{student?.email}</p>
                      <p className="text-sm text-muted-foreground">{student?.studentId}</p>
                      {student?.grade && (
                        <p className="text-sm text-muted-foreground">{student?.grade}</p>
                      )}
                      {student?.enrollmentDate && (
                        <p className="text-sm text-muted-foreground">
                          Inscrit le {new Date(student.enrollmentDate)?.toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      onClick={() => console.log('View student:', student?.id)}
                    />
                    {activeTab === 'enrolled' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="UserMinus"
                        onClick={() => handleBulkAction('remove')}
                        className="text-destructive hover:text-destructive"
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="UserPlus"
                        onClick={() => handleBulkAction('add')}
                        className="text-success hover:text-success"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredStudents?.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucun étudiant trouvé
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Aucun étudiant ne correspond à votre recherche.'
                    : `Aucun étudiant ${activeTab === 'enrolled' ? 'inscrit' : 'disponible'} pour cette classe.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Capacité: {selectedClass?.studentCount}/{selectedClass?.capacity} étudiants
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button
                iconName="Download"
                iconPosition="left"
                onClick={() => console.log('Export enrollment data')}
              >
                Exporter la Liste
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;