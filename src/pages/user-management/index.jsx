import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUsersBySchool, getAllSchools, createSchool, updateSchool, deleteSchool, createStudent, updateStudent, deleteStudent, createTeacher, updateUserProfile, deleteUser, resetUserPassword, enrollStudent } from '../../services/supabaseService';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import components
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import BulkActions from './components/BulkActions';
import AddUserModal from './components/AddUserModal';
import EditUserModal from './components/EditUserModal';
import UserProfileModal from './components/UserProfileModal';

const UserManagement = () => {
  const { userProfile, isSuperAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    lastLoginFrom: '',
    lastLoginTo: ''
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Data states
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [userProfile?.role]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isSuperAdmin()) {
        // Super Admin: Load schools (which are the "users" they manage)
        const schoolsData = await getAllSchools();
        setSchools(schoolsData || []);
        setUsers(schoolsData?.map(school => ({
          id: school?.id,
          name: school?.name,
          email: school?.email,
          phone: school?.phone,
          role: 'school_admin',
          status: school?.status,
          avatar: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center`,
          lastLogin: null,
          associatedData: `Code: ${school?.code}`,
          createdAt: school?.created_at ? school.created_at.split('T')[0] : null,
          address: school?.address,
          academic_year: school?.academic_year,
          schoolCode: school?.code
        })) || []);
      } else {
        // School Admin or Teacher: Load users within their school
        const usersData = await getUsersBySchool(userProfile?.school_id);
        setUsers(usersData || []);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on current filters and role
  const filteredUsers = useMemo(() => {
    return users?.filter(user => {
      const matchesSearch = !filters?.search || 
        user?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        user?.email?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        user?.schoolCode?.toLowerCase()?.includes(filters?.search?.toLowerCase());
      
      const matchesRole = !filters?.role || user?.role === filters?.role;
      const matchesStatus = !filters?.status || user?.status === filters?.status;
      
      const matchesDateRange = !filters?.lastLoginFrom || 
        (user?.lastLogin && new Date(user?.lastLogin) >= new Date(filters?.lastLoginFrom));

      return matchesSearch && matchesRole && matchesStatus && matchesDateRange;
    });
  }, [users, filters]);

  // Handle school actions (for Super Admin)
  const handleAddSchool = async (schoolData) => {
    try {
      setLoading(true);
      const newSchool = await createSchool({
        name: schoolData?.name,
        code: schoolData?.code,
        email: schoolData?.email,
        phone: schoolData?.phone,
        address: schoolData?.address,
        status: schoolData?.status || 'active',
        academic_year: schoolData?.academic_year || '2024-2025'
      });
      
      if (newSchool) {
        await loadData(); // Reload data
        setShowAddModal(false);
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'école');
      console.error('Error creating school:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchool = async (updatedSchool) => {
    try {
      setLoading(true);
      await updateSchool(updatedSchool?.id, {
        name: updatedSchool?.name,
        email: updatedSchool?.email,
        phone: updatedSchool?.phone,
        address: updatedSchool?.address,
        status: updatedSchool?.status
      });
      
      await loadData(); // Reload data
      setShowEditModal(false);
    } catch (err) {
      setError('Erreur lors de la modification de l\'école');
      console.error('Error updating school:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async (school) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'école ${school?.name} ?`)) {
      try {
        setLoading(true);
        await deleteSchool(school?.id);
        await loadData(); // Reload data
        setSelectedUsers(prev => prev?.filter(id => id !== school?.id));
      } catch (err) {
        setError('Erreur lors de la suppression de l\'école');
        console.error('Error deleting school:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle user actions (for School Admin/Teacher)
  const handleAddUser = async (userData) => {
    try {
      setLoading(true);
      
      if (userData?.role === 'student') {
        const newStudent = await createStudent({
          full_name: `${userData?.firstName} ${userData?.lastName}`,
          parent_name: userData?.parentName,
          parent_phone: userData?.parentPhone,
          parent_email: userData?.parentEmail,
          date_of_birth: userData?.dateOfBirth,
          gender: userData?.gender,
          address: userData?.address,
          school_id: userProfile?.school_id,
          status: userData?.status || 'active'
        });
        
        if (newStudent && userData?.classId) {
          await enrollStudent(newStudent?.id, userData?.classId);
        }
      } else if (userData?.role === 'teacher') {
        await createTeacher({
          full_name: `${userData?.firstName} ${userData?.lastName}`,
          email: userData?.email,
          phone: userData?.phone,
          role: 'teacher',
          school_id: userProfile?.school_id
        });
      }
      
      await loadData(); // Reload data
      setShowAddModal(false);
    } catch (err) {
      setError('Erreur lors de la création de l\'utilisateur');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (updatedUser) => {
    try {
      setLoading(true);
      
      if (updatedUser?.role === 'student') {
        await updateStudent(updatedUser?.id, {
          full_name: updatedUser?.name,
          parent_name: updatedUser?.parentName,
          parent_phone: updatedUser?.parentPhone,
          parent_email: updatedUser?.parentEmail,
          status: updatedUser?.status
        });
      } else {
        await updateUserProfile(updatedUser?.id, {
          full_name: updatedUser?.name,
          email: updatedUser?.email,
          phone: updatedUser?.phone,
          is_active: updatedUser?.status === 'active'
        });
      }
      
      await loadData(); // Reload data
      setShowEditModal(false);
    } catch (err) {
      setError('Erreur lors de la modification de l\'utilisateur');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user?.name} ?`)) {
      try {
        setLoading(true);
        
        if (user?.role === 'student') {
          await deleteStudent(user?.id);
        } else {
          await deleteUser(user?.id);
        }
        
        await loadData(); // Reload data
        setSelectedUsers(prev => prev?.filter(id => id !== user?.id));
      } catch (err) {
        setError('Erreur lors de la suppression de l\'utilisateur');
        console.error('Error deleting user:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async (user) => {
    if (window.confirm(`Réinitialiser le mot de passe pour ${user?.name} ?`)) {
      try {
        await resetUserPassword(user?.email);
        alert(`Un email de réinitialisation a été envoyé à ${user?.email}`);
      } catch (err) {
        setError('Erreur lors de la réinitialisation du mot de passe');
        console.error('Error resetting password:', err);
      }
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleBulkAction = async (action, userIds) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'activate':
          for (const userId of userIds) {
            const user = users?.find(u => u?.id === userId);
            if (isSuperAdmin()) {
              await updateSchool(userId, { status: 'active' });
            } else if (user?.role === 'student') {
              await updateStudent(userId, { status: 'active' });
            } else {
              await updateUserProfile(userId, { is_active: true });
            }
          }
          break;
        case 'deactivate':
          for (const userId of userIds) {
            const user = users?.find(u => u?.id === userId);
            if (isSuperAdmin()) {
              await updateSchool(userId, { status: 'inactive' });
            } else if (user?.role === 'student') {
              await updateStudent(userId, { status: 'inactive' });
            } else {
              await updateUserProfile(userId, { is_active: false });
            }
          }
          break;
        case 'suspend':
          for (const userId of userIds) {
            const user = users?.find(u => u?.id === userId);
            if (isSuperAdmin()) {
              await updateSchool(userId, { status: 'suspended' });
            } else if (user?.role === 'student') {
              await updateStudent(userId, { status: 'suspended' });
            }
          }
          break;
        case 'reset-password':
          for (const userId of userIds) {
            const user = users?.find(u => u?.id === userId);
            if (user?.email) {
              await resetUserPassword(user?.email);
            }
          }
          alert(`Mots de passe réinitialisés pour ${userIds?.length} utilisateur(s)`);
          break;
        case 'export':
          const exportData = users?.filter(u => userIds?.includes(u?.id));
          const csvContent = generateCSV(exportData);
          downloadCSV(csvContent, `users_${new Date()?.toISOString()?.split('T')?.[0]}.csv`);
          alert(`Export de ${userIds?.length} utilisateur(s) terminé`);
          break;
        case 'delete':
          if (window.confirm(`Supprimer ${userIds?.length} utilisateur(s) sélectionné(s) ?`)) {
            for (const userId of userIds) {
              const user = users?.find(u => u?.id === userId);
              if (isSuperAdmin()) {
                await deleteSchool(userId);
              } else if (user?.role === 'student') {
                await deleteStudent(userId);
              } else {
                await deleteUser(userId);
              }
            }
            setSelectedUsers([]);
          }
          break;
        case 'clear-selection':
          setSelectedUsers([]);
          return; // Early return to avoid reloading data
        default:
          console.log('Unknown bulk action:', action);
          return; // Early return for unknown actions
      }
      
      await loadData(); // Reload data after bulk operations
    } catch (err) {
      setError('Erreur lors de l\'action groupée');
      console.error('Error in bulk action:', err);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for CSV export
  const generateCSV = (data) => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Données Associées', 'Date de Création'];
    const rows = data?.map(user => [
      user?.name,
      user?.email || '',
      user?.phone || '',
      user?.role,
      user?.status,
      user?.associatedData || '',
      user?.createdAt
    ]);
    
    return [headers, ...rows]?.map(row => row?.join(','))?.join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // Get role-specific statistics
  const getRoleStats = () => {
    if (isSuperAdmin()) {
      return {
        total: users?.length,
        active: users?.filter(u => u?.status === 'active')?.length,
        inactive: users?.filter(u => u?.status === 'inactive')?.length,
        suspended: users?.filter(u => u?.status === 'suspended')?.length
      };
    } else {
      return {
        total: users?.length,
        active: users?.filter(u => u?.status === 'active')?.length,
        teachers: users?.filter(u => u?.role === 'teacher')?.length,
        students: users?.filter(u => u?.role === 'student')?.length
      };
    }
  };

  const stats = getRoleStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
      />
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Main Content */}
      <main className={`
        pt-16 transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}>
        <div className="p-6">
          {/* Breadcrumb */}
          <BreadcrumbTrail />

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} />
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-destructive hover:text-destructive/80"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isSuperAdmin() ? 'Gestion des Écoles' : 'Gestion des Utilisateurs'}
              </h1>
              <p className="text-muted-foreground">
                {isSuperAdmin() 
                  ? 'Créez, modifiez et gérez toutes les écoles du système avec leurs tableaux de bord d\'évolution.'
                  : 'Créez, modifiez et gérez tous les utilisateurs de votre école avec des contrôles basés sur les rôles.'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={() => handleBulkAction('export', filteredUsers?.map(u => u?.id))}
              >
                Exporter
              </Button>
              <Button
                iconName={isSuperAdmin() ? "Building" : "UserPlus"}
                iconPosition="left"
                onClick={() => setShowAddModal(true)}
              >
                {isSuperAdmin() ? 'Ajouter une école' : 'Ajouter un utilisateur'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isSuperAdmin() ? 'Total Écoles' : 'Total Utilisateurs'}
                      </p>
                      <p className="text-2xl font-bold text-foreground">{stats?.total}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={isSuperAdmin() ? "Building" : "Users"} size={20} className="text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isSuperAdmin() ? 'Écoles Actives' : 'Utilisateurs Actifs'}
                      </p>
                      <p className="text-2xl font-bold text-success">{stats?.active}</p>
                    </div>
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <Icon name="UserCheck" size={20} className="text-success" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isSuperAdmin() ? 'Écoles Inactives' : 'Enseignants'}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {isSuperAdmin() ? stats?.inactive : stats?.teachers}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={isSuperAdmin() ? "XCircle" : "BookOpen"} size={20} className="text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isSuperAdmin() ? 'Écoles Suspendues' : 'Étudiants'}
                      </p>
                      <p className="text-2xl font-bold text-accent">
                        {isSuperAdmin() ? stats?.suspended : stats?.students}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Icon name={isSuperAdmin() ? "AlertTriangle" : "GraduationCap"} size={20} className="text-accent" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <UserFilters
                onFiltersChange={setFilters}
                totalUsers={users?.length}
                filteredUsers={filteredUsers?.length}
                userRole={userProfile?.role}
              />

              {/* Bulk Actions */}
              <BulkActions
                selectedUsers={selectedUsers}
                onBulkAction={handleBulkAction}
                totalUsers={filteredUsers?.length}
                userRole={userProfile?.role}
              />

              {/* Users Table */}
              <UserTable
                users={filteredUsers}
                onEdit={handleEditClick}
                onDelete={isSuperAdmin() ? handleDeleteSchool : handleDeleteUser}
                onResetPassword={handleResetPassword}
                onViewProfile={handleViewProfile}
                selectedUsers={selectedUsers}
                onSelectionChange={setSelectedUsers}
                userRole={userProfile?.role}
              />
            </div>

            {/* Sidebar Panel */}
            <div className="xl:col-span-1">
              <QuickActionPanel userRole={userProfile?.role} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={isSuperAdmin() ? handleAddSchool : handleAddUser}
        userRole={userProfile?.role}
      />
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={isSuperAdmin() ? handleEditSchool : handleEditUser}
        user={selectedUser}
        userRole={userProfile?.role}
      />
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={selectedUser}
        userRole={userProfile?.role}
      />
    </div>
  );
};

export default UserManagement;