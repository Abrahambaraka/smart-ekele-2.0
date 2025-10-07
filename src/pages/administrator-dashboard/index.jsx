import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import MetricCard from './components/MetricCard';
import ActivityFeed from './components/ActivityFeed';
import EnrollmentChart from './components/EnrollmentChart';
import PaymentStatusChart from './components/PaymentStatusChart';
import NotificationCenter from './components/NotificationCenter';
import QuickStats from './components/QuickStats';
import RecentActions from './components/RecentActions';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { schoolService, studentService, paymentService, notificationService } from '../../services/supabaseService';

const AdministratorDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalSchools: 0,
    activeClasses: 0,
    pendingPayments: 0,
    unreadNotifications: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load different data based on user role
      if (userProfile?.role === 'super_admin') {
        await loadSuperAdminData();
      } else {
        await loadSchoolAdminData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuperAdminData = async () => {
    try {
      // Load data for super admin - all schools
      const [schoolsRes, studentsRes, paymentsRes, notificationsRes] = await Promise.all([
        schoolService?.getAllSchools(),
        studentService?.getAllStudents(),
        paymentService?.getOverduePayments(),
        notificationService?.getAllNotifications()
      ]);

      const schools = schoolsRes?.data || [];
      const students = studentsRes?.data || [];
      const overduePayments = paymentsRes?.data || [];
      const notifications = notificationsRes?.data || [];

      // Calculate metrics
      setDashboardData({
        totalStudents: students?.length,
        totalSchools: schools?.length,
        activeClasses: schools?.reduce((total, school) => total + (school?.classes?.length || 0), 0),
        pendingPayments: overduePayments?.length,
        unreadNotifications: notifications?.filter(n => n?.delivery_status === 'pending')?.length,
        monthlyRevenue: overduePayments?.reduce((total, payment) => total + parseFloat(payment?.amount || 0), 0)
      });
    } catch (error) {
      console.error('Error loading super admin data:', error);
    }
  };

  const loadSchoolAdminData = async () => {
    try {
      // For school admins, load data for their specific school
      const [studentsRes, paymentsRes, notificationsRes] = await Promise.all([
        studentService?.getAllStudents(),
        paymentService?.getOverduePayments(),
        notificationService?.getAllNotifications()
      ]);

      const students = studentsRes?.data || [];
      const overduePayments = paymentsRes?.data || [];
      const notifications = notificationsRes?.data || [];

      setDashboardData({
        totalStudents: students?.length,
        totalSchools: 1, // School admin manages one school
        activeClasses: students?.reduce((acc, student) => {
          const classIds = student?.enrollments?.map(e => e?.class?.id) || [];
          return acc + new Set(classIds)?.size;
        }, 0),
        pendingPayments: overduePayments?.length,
        unreadNotifications: notifications?.filter(n => n?.delivery_status === 'pending')?.length,
        monthlyRevenue: overduePayments?.reduce((total, payment) => total + parseFloat(payment?.amount || 0), 0)
      });
    } catch (error) {
      console.error('Error loading school admin data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Generate dashboard metrics with real data
  const dashboardMetrics = [
    {
      title: userProfile?.role === 'super_admin' ? 'Écoles Totales' : 'Étudiants Totaux',
      value: userProfile?.role === 'super_admin' ? dashboardData?.totalSchools?.toString() : dashboardData?.totalStudents?.toString(),
      change: '+12',
      changeType: 'positive',
      icon: userProfile?.role === 'super_admin' ? 'Building' : 'Users',
      description: userProfile?.role === 'super_admin' ? 'Écoles actives' : 'Inscrits cette année',
      onClick: () => navigate(userProfile?.role === 'super_admin' ? '/school-management' : '/student-management')
    },
    {
      title: 'Classes Actives',
      value: dashboardData?.activeClasses?.toString(),
      change: '+2',
      changeType: 'positive',
      icon: 'BookOpen',
      description: 'En cours ce semestre',
      onClick: () => navigate('/class-management')
    },
    {
      title: 'Paiements en Retard',
      value: dashboardData?.pendingPayments?.toString(),
      change: '-8',
      changeType: 'positive',
      icon: 'CreditCard',
      description: 'À traiter',
      onClick: () => navigate('/payment-management')
    },
    {
      title: 'Notifications',
      value: dashboardData?.unreadNotifications?.toString(),
      change: '+5',
      changeType: 'warning',
      icon: 'Bell',
      description: 'Non lues',
      onClick: () => navigate('/notification-center')
    },
    {
      title: 'Revenus Mensuels',
      value: `${(dashboardData?.monthlyRevenue / 1000)?.toFixed(0)}k FCFA`,
      change: '+15%',
      changeType: 'positive',
      icon: 'TrendingUp',
      description: 'Décembre 2024',
      onClick: () => navigate('/reports-dashboard')
    },
    {
      title: userProfile?.role === 'super_admin' ? 'Utilisateurs' : 'Étudiants',
      value: dashboardData?.totalStudents?.toString(),
      change: 'stable',
      changeType: 'neutral',
      icon: 'UserCheck',
      description: 'Personnel actif',
      onClick: () => navigate('/user-management')
    }
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={handleSidebarToggle} isMenuOpen={sidebarOpen} />
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose} 
        />
        <main className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)]?.map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-muted rounded-lg"></div>
                <div className="h-96 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentification requise</h2>
          <p className="text-muted-foreground mb-4">Veuillez vous connecter pour accéder au tableau de bord.</p>
          <Button onClick={() => navigate('/login')}>Se connecter</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={handleSidebarToggle} isMenuOpen={sidebarOpen} />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
      />
      <main className={`pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <BreadcrumbTrail />
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {userProfile?.role === 'super_admin' ? 'Tableau de Bord Super Admin' : 'Tableau de Bord Administrateur'}
                </h1>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" title="Système actif" />
              </div>
              <p className="text-muted-foreground mt-1">
                {userProfile?.role === 'super_admin' ?'Gestion globale du système Smart Ekele' :'Vue d\'ensemble des opérations scolaires'
                } - {new Date()?.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                iconName="RefreshCw" 
                loading={refreshing}
                onClick={handleRefresh}
              >
                Actualiser
              </Button>
              <Button 
                variant="default" 
                iconName="Download"
                onClick={() => navigate('/reports-dashboard')}
              >
                Exporter
              </Button>
            </div>
          </div>

          {/* User Welcome */}
          {userProfile && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Bienvenue, {userProfile?.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.role === 'super_admin' ? 'Super Administrateur' : 
                     userProfile?.role === 'school_admin' ? 'Administrateur École' : 
                     userProfile?.role === 'teacher'? 'Enseignant' : 'Utilisateur'} • {userProfile?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <QuickStats />

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardMetrics?.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                change={metric?.change}
                changeType={metric?.changeType}
                icon={metric?.icon}
                description={metric?.description}
                onClick={metric?.onClick}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnrollmentChart />
            <PaymentStatusChart />
          </div>

          {/* Activity and Actions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityFeed />
            </div>
            <div className="space-y-6">
              <QuickActionPanel userRole={userProfile?.role || "administrator"} />
              <RecentActions />
            </div>
          </div>

          {/* Notification Center */}
          <NotificationCenter />

          {/* System Status Footer */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Système opérationnel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Database" size={14} className="text-success" />
                  <span className="text-sm text-muted-foreground">Base de données: OK</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Wifi" size={14} className="text-success" />
                  <span className="text-sm text-muted-foreground">Connexion: Stable</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Dernière mise à jour: {new Date()?.toLocaleTimeString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdministratorDashboard;