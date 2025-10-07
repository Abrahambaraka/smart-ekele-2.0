import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import Button from '../../components/ui/Button';

// Import components
import StudentTable from './components/StudentTable';
import StudentFilters from './components/StudentFilters';
import StudentProfileModal from './components/StudentProfileModal';
import AddStudentModal from './components/AddStudentModal';
import BulkActionsPanel from './components/BulkActionsPanel';
import StudentStatsCards from './components/StudentStatsCards';

// Import services
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/supabaseService';

const StudentManagement = () => {
  const { user, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Student data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Selection and sorting states
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'asc' });

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await studentService?.getAllStudents();
      
      if (fetchError) {
        setError(fetchError?.message || 'Erreur lors du chargement des étudiants');
        return;
      }

      // Transform data to match expected format
      const transformedStudents = data?.map(student => ({
        id: student?.id,
        name: student?.full_name,
        email: student?.user_id ? `${student?.full_name?.toLowerCase()?.replace(/\s+/g, '.')}@student.com` : '',
        studentId: student?.student_id,
        class: student?.enrollments?.[0]?.class?.name || 'Non assigné',
        section: student?.enrollments?.[0]?.class?.section || '',
        status: student?.status === 'active' ? 'Actif' : 
                student?.status === 'suspended' ? 'Suspendu' : 
                student?.status === 'graduated' ? 'Diplômé' :
                student?.status === 'transferred' ? 'Transféré' : 'Inactif',
        parentName: student?.parent_name,
        parentPhone: student?.parent_phone,
        paymentStatus: 'À jour', // This would come from payments data
        enrollmentDate: student?.enrollment_date ? new Date(student?.enrollment_date)?.toLocaleDateString('fr-FR') : '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.full_name}`
      })) || [];

      setStudents(transformedStudents);
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and filter criteria
  const filteredStudents = useMemo(() => {
    return students?.filter(student => {
      const matchesSearch = !searchTerm || 
        student?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        student?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        student?.studentId?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      const matchesClass = !selectedClass || student?.class === selectedClass;
      const matchesStatus = !selectedStatus || student?.status === selectedStatus;
      const matchesPaymentStatus = !selectedPaymentStatus || student?.paymentStatus === selectedPaymentStatus;
      
      return matchesSearch && matchesClass && matchesStatus && matchesPaymentStatus;
    });
  }, [students, searchTerm, selectedClass, selectedStatus, selectedPaymentStatus]);

  // Sort filtered students
  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents];
    sorted?.sort((a, b) => {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];
      
      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredStudents, sortConfig]);

  // Event handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev?.includes(studentId) 
        ? prev?.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(prev => 
      prev?.length === sortedStudents?.length ? [] : sortedStudents?.map(s => s?.id)
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedStatus('');
    setSelectedPaymentStatus('');
    setSelectedAcademicYear('2024-2025');
  };

  const handleAddStudent = async (studentData) => {
    try {
      const { data, error } = await studentService?.createStudent(studentData);
      
      if (error) {
        console.error('Error creating student:', error);
        return;
      }

      // Reload students to get updated list
      await loadStudents();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding student:', err);
    }
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const handleEditStudent = async (student) => {
    // Implementation for editing student
    console.log('Edit student:', student);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${student?.name} ?`)) {
      try {
        const { error } = await studentService?.deleteStudent(student?.id);
        
        if (error) {
          console.error('Error deleting student:', error);
          return;
        }

        // Reload students
        await loadStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  };

  const handleViewAcademicRecord = (student) => {
    console.log('View academic record:', student);
  };

  const handleViewAttendance = (student) => {
    console.log('View attendance:', student);
  };

  const handleViewPayments = (student) => {
    console.log('View payments:', student);
  };

  const handleContactParent = (student) => {
    console.log('Contact parent:', student);
  };

  // Bulk actions
  const handleBulkDelete = async (studentIds) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${studentIds?.length} étudiant(s) ?`)) {
      try {
        // Delete multiple students
        await Promise.all(studentIds?.map(id => studentService?.deleteStudent(id)));
        
        // Reload students
        await loadStudents();
        setSelectedStudents([]);
      } catch (err) {
        console.error('Error in bulk delete:', err);
      }
    }
  };

  const handleBulkClassTransfer = (studentIds, targetClass) => {
    console.log('Bulk class transfer:', studentIds, targetClass);
    setSelectedStudents([]);
  };

  const handleBulkStatusChange = (studentIds, targetStatus) => {
    console.log('Bulk status change:', studentIds, targetStatus);
    setSelectedStudents([]);
  };

  const handleBulkExport = (studentIds) => {
    const selectedStudentData = students?.filter(s => studentIds?.includes(s?.id));
    const csvContent = [
      ['Nom', 'Email', 'ID Étudiant', 'Classe', 'Statut', 'Parent', 'Téléphone Parent', 'Statut Paiement'],
      ...selectedStudentData?.map(s => [
        s?.name, s?.email, s?.studentId, s?.class, s?.status, s?.parentName, s?.parentPhone, s?.paymentStatus
      ])
    ]?.map(row => row?.join(','))?.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etudiants_${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  const handleBulkImport = () => {
    console.log('Bulk import students');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMenuOpen={isSidebarOpen}
        />
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className={`pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)]?.map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadStudents}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <BreadcrumbTrail />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Gestion des Étudiants
              </h1>
              <p className="text-muted-foreground">
                Gérez les inscriptions, suivez les progrès académiques et maintenez les dossiers étudiants
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={handleBulkImport}
                iconName="Upload"
                iconPosition="left"
              >
                Import Groupé
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Ajouter Étudiant
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-6">
              {/* Statistics Cards */}
              <StudentStatsCards students={students} />

              {/* Filters */}
              <StudentFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedClass={selectedClass}
                onClassChange={setSelectedClass}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedPaymentStatus={selectedPaymentStatus}
                onPaymentStatusChange={setSelectedPaymentStatus}
                selectedAcademicYear={selectedAcademicYear}
                onAcademicYearChange={setSelectedAcademicYear}
                resultCount={filteredStudents?.length}
                onClearFilters={handleClearFilters}
              />

              {/* Student Table */}
              <StudentTable
                students={sortedStudents}
                onViewProfile={handleViewProfile}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                onViewAcademicRecord={handleViewAcademicRecord}
                onViewAttendance={handleViewAttendance}
                onViewPayments={handleViewPayments}
                onContactParent={handleContactParent}
                selectedStudents={selectedStudents}
                onSelectStudent={handleSelectStudent}
                onSelectAll={handleSelectAll}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>

            {/* Sidebar Panel */}
            <div className="xl:col-span-1">
              <QuickActionPanel userRole={userProfile?.role || "administrator"} />
            </div>
          </div>
        </div>
      </main>
      {/* Modals */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddStudent}
      />
      <StudentProfileModal
        student={selectedStudent}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onEdit={handleEditStudent}
      />
      {/* Bulk Actions Panel */}
      <BulkActionsPanel
        selectedStudents={selectedStudents}
        onClearSelection={() => setSelectedStudents([])}
        onBulkDelete={handleBulkDelete}
        onBulkClassTransfer={handleBulkClassTransfer}
        onBulkExport={handleBulkExport}
        onBulkStatusChange={handleBulkStatusChange}
      />
    </div>
  );
};

export default StudentManagement;