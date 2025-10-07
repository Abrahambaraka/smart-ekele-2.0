import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Import components
import ClassTable from './components/ClassTable';
import CreateClassModal from './components/CreateClassModal';
import EnrollmentModal from './components/EnrollmentModal';
import ClassStatsCards from './components/ClassStatsCards';
import ClassScheduleCalendar from './components/ClassScheduleCalendar';

const ClassManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeView, setActiveView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    teacher: '',
    year: '',
    status: ''
  });

  // Mock classes data
  const [classes, setClasses] = useState([
    {
      id: '1',
      name: 'Mathématiques Avancées',
      code: 'MATH-ADV-2024',
      subject: 'mathematiques',
      teacher: 'Marie Dubois',
      teacherId: 'marie-dubois',
      studentCount: 28,
      capacity: 30,
      academicYear: '2024-2025',
      room: 'A-101',
      status: 'active',
      schedule: {
        days: 'lundi',
        time: '08:00 - 10:00',
        startTime: '08:00',
        endTime: '10:00'
      },
      description: `Cours avancé de mathématiques couvrant l'algèbre linéaire, le calcul différentiel et intégral.\nPréparation aux examens du baccalauréat scientifique.`,
      createdAt: '2024-09-01T08:00:00Z'
    },
    {
      id: '2',name: 'Littérature Française',code: 'FRAN-LIT-2024',subject: 'francais',teacher: 'Sophie Bernard',teacherId: 'sophie-bernard',studentCount: 25,capacity: 28,academicYear: '2024-2025',room: 'B-205',status: 'active',
      schedule: {
        days: 'mardi',time: '10:00 - 12:00',startTime: '10:00',endTime: '12:00'
      },
      description: `Étude approfondie de la littérature française du XVIIe au XXe siècle.\nAnalyse des œuvres majeures et techniques de dissertation.`,
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: '3',name: 'Sciences Physiques',code: 'PHYS-SCI-2024',subject: 'physique',teacher: 'Jean Martin',teacherId: 'jean-martin',studentCount: 22,capacity: 25,academicYear: '2024-2025',room: 'C-301',status: 'active',
      schedule: {
        days: 'mercredi',time: '14:00 - 16:00',startTime: '14:00',endTime: '16:00'
      },
      description: `Cours de physique expérimentale avec travaux pratiques.\nMécanique, thermodynamique et électricité.`,
      createdAt: '2024-09-02T14:00:00Z'
    },
    {
      id: '4',name: 'Histoire Contemporaine',code: 'HIST-CONT-2024',subject: 'histoire',teacher: 'Pierre Durand',teacherId: 'pierre-durand',studentCount: 30,capacity: 30,academicYear: '2024-2025',room: 'D-102',status: 'full',
      schedule: {
        days: 'jeudi',time: '09:00 - 11:00',startTime: '09:00',endTime: '11:00'
      },
      description: `Histoire du XXe siècle: guerres mondiales, décolonisation, guerre froide.\nMéthodes d'analyse historique et commentaire de documents.`,
      createdAt: '2024-09-03T09:00:00Z'
    },
    {
      id: '5',
      name: 'Anglais Conversationnel',
      code: 'ENG-CONV-2024',
      subject: 'anglais',
      teacher: 'Claire Moreau',
      teacherId: 'claire-moreau',
      studentCount: 18,
      capacity: 20,
      academicYear: '2024-2025',
      room: 'E-203',
      status: 'active',
      schedule: {
        days: 'vendredi',
        time: '11:00 - 12:30',
        startTime: '11:00',
        endTime: '12:30'
      },
      description: `Cours d'anglais axé sur la conversation et l'expression orale.\nPréparation aux certifications internationales.`,
      createdAt: '2024-09-04T11:00:00Z'
    },
    {
      id: '6',
      name: 'Chimie Organique',
      code: 'CHEM-ORG-2024',
      subject: 'chimie',
      teacher: 'Antoine Rousseau',
      teacherId: 'antoine-rousseau',
      studentCount: 0,
      capacity: 24,
      academicYear: '2024-2025',
      room: 'F-104',
      status: 'pending',
      schedule: {
        days: 'lundi',
        time: '15:00 - 17:00',
        startTime: '15:00',
        endTime: '17:00'
      },
      description: `Introduction à la chimie organique: structure, nomenclature et réactions.\nTravaux pratiques en laboratoire.`,
      createdAt: '2024-09-05T15:00:00Z'
    }
  ]);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCreateClass = (newClass) => {
    setClasses(prev => [...prev, newClass]);
    console.log('New class created:', newClass);
  };

  const handleEditClass = (classItem) => {
    console.log('Edit class:', classItem);
    // Implementation for editing class
  };

  const handleManageEnrollment = (classItem) => {
    setSelectedClass(classItem);
    setIsEnrollmentModalOpen(true);
  };

  const handleViewRoster = (classItem) => {
    console.log('View roster for:', classItem);
    // Implementation for viewing class roster
  };

  const handleViewAttendance = (classItem) => {
    console.log('View attendance for:', classItem);
    // Implementation for viewing attendance
  };

  const handleUpdateEnrollment = (studentIds, action) => {
    console.log('Update enrollment:', { studentIds, action, classId: selectedClass?.id });
    // Implementation for updating enrollment
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleScheduleClick = (classItem) => {
    console.log('Schedule clicked:', classItem);
    setSelectedClass(classItem);
  };

  const viewOptions = [
    { id: 'table', label: 'Vue Tableau', icon: 'Table' },
    { id: 'calendar', label: 'Planning', icon: 'Calendar' }
  ];

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isSidebarOpen}
      />
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* Main Content */}
      <main className="lg:ml-60 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <BreadcrumbTrail />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Gestion des Classes
              </h1>
              <p className="text-muted-foreground">
                Créez, organisez et gérez les classes académiques avec les inscriptions d'étudiants
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                {viewOptions?.map((option) => (
                  <button
                    key={option?.id}
                    onClick={() => setActiveView(option?.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-micro ${
                      activeView === option?.id
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={option?.icon} size={16} />
                    <span className="hidden sm:inline">{option?.label}</span>
                  </button>
                ))}
              </div>

              <Button
                iconName="Plus"
                iconPosition="left"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Créer une Classe
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <ClassStatsCards classes={classes} />

          {/* Main Content Area */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Primary Content */}
            <div className="xl:col-span-3">
              {activeView === 'table' ? (
                <ClassTable
                  classes={classes}
                  onEditClass={handleEditClass}
                  onManageEnrollment={handleManageEnrollment}
                  onViewRoster={handleViewRoster}
                  onViewAttendance={handleViewAttendance}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              ) : (
                <ClassScheduleCalendar
                  classes={classes}
                  onScheduleClick={handleScheduleClick}
                />
              )}
            </div>

            {/* Sidebar Panel */}
            <div className="xl:col-span-1 space-y-6">
              <QuickActionPanel userRole="administrator" />
              
              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="Activity" size={18} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Activité Récente</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Nouvelle classe</span> créée: Chimie Organique
                      <div className="text-muted-foreground mt-1">Il y a 2 heures</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">28 étudiants</span> inscrits en Mathématiques
                      <div className="text-muted-foreground mt-1">Il y a 4 heures</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Histoire Contemporaine</span> est complète
                      <div className="text-muted-foreground mt-1">Hier</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="BarChart3" size={18} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Statistiques Rapides</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Classes cette semaine</span>
                    <span className="text-sm font-medium text-foreground">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Nouveaux étudiants</span>
                    <span className="text-sm font-medium text-foreground">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Taux de présence</span>
                    <span className="text-sm font-medium text-success">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Modals */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateClass={handleCreateClass}
      />
      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        selectedClass={selectedClass}
        onUpdateEnrollment={handleUpdateEnrollment}
      />
    </div>
  );
};

export default ClassManagement;