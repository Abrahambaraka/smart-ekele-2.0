import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPaymentsBySchool } from '../../services/supabaseService';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import PaymentSummaryCards from './components/PaymentSummaryCards';
import PaymentFilters from './components/PaymentFilters';
import PaymentTable from './components/PaymentTable';
import PaymentModal from './components/PaymentModal';
import ReminderModal from './components/ReminderModal';
import PaymentHistoryModal from './components/PaymentHistoryModal';

const PaymentManagement = () => {
  const { userProfile, isSuperAdmin, isSchoolAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [filters, setFilters] = useState({});
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load payments data based on user role
  useEffect(() => {
    const loadPayments = async () => {
      if (!userProfile) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let paymentData;
        
        if (isSuperAdmin()) {
          // Super admin can see all payments (for dashboard overview)
          paymentData = await getPaymentsBySchool();
        } else if (isSchoolAdmin()) {
          // School admin sees only their school's payments
          const schoolId = userProfile?.school_id || userProfile?.id; // Get school from profile
          paymentData = await getPaymentsBySchool(schoolId);
        } else {
          // Other roles don't have access to payment management setError('Vous n\'avez pas accès à cette section.');
          return;
        }
        
        setPayments(paymentData || []);
      } catch (err) {
        console.error('Error loading payments:', err);
        setError('Erreur lors du chargement des paiements');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [userProfile, isSuperAdmin, isSchoolAdmin]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleRecordPayment = (studentData = null) => {
    setPaymentModalOpen(true);
  };

  const handleSendReminder = (paymentIds = []) => {
    setSelectedPayments(paymentIds);
    setReminderModalOpen(true);
  };

  const handleViewHistory = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setHistoryModalOpen(true);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePaymentUpdate = () => {
    // Refresh payments list after update
    const loadPayments = async () => {
      try {
        setLoading(true);
        let paymentData;
        
        if (isSuperAdmin()) {
          paymentData = await getPaymentsBySchool();
        } else if (isSchoolAdmin()) {
          const schoolId = userProfile?.school_id || userProfile?.id;
          paymentData = await getPaymentsBySchool(schoolId);
        }
        
        setPayments(paymentData || []);
      } catch (err) {
        console.error('Error refreshing payments:', err);
        setError('Erreur lors de la mise à jour des paiements');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && error?.includes('accès')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-error rounded-full"></div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Accès Refusé</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={handleMenuToggle}
        isMenuOpen={sidebarOpen}
      />
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />
      {/* Main Content */}
      <main className={`
        pt-16 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}>
        <div className="p-6 space-y-6">
          {/* Breadcrumb */}
          <BreadcrumbTrail />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion Financière</h1>
              <p className="text-muted-foreground mt-1">
                Suivi des paiements et gestion des frais de scolarité
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-micro"
                aria-label={sidebarCollapsed ? 'Développer la sidebar' : 'Réduire la sidebar'}
              >
                <div className={`w-4 h-4 border-2 border-muted-foreground rounded transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && !error?.includes('accès') && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error">
              {error}
            </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-6">
              {/* Financial Summary Cards */}
              <PaymentSummaryCards payments={payments} loading={loading} />

              {/* Payment Filters */}
              <PaymentFilters onFiltersChange={handleFiltersChange} />

              {/* Payment Table */}
              <PaymentTable
                payments={payments}
                loading={loading}
                filters={filters}
                onRecordPayment={handleRecordPayment}
                onSendReminder={handleSendReminder}
                onViewHistory={handleViewHistory}
                onPaymentUpdate={handlePaymentUpdate}
              />
            </div>

            {/* Sidebar Content */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Actions Panel */}
              <QuickActionPanel userRole={userProfile?.role || 'school_admin'} />

              {/* Payment Statistics */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Statistiques Rapides</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Paiements</span>
                    <span className="text-sm font-semibold text-foreground">{payments?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Paiements Payés</span>
                    <span className="text-sm font-semibold text-success">
                      {payments?.filter(p => p?.status === 'paid')?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Paiements en Retard</span>
                    <span className="text-sm font-semibold text-error">
                      {payments?.filter(p => p?.status === 'overdue')?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">En Attente</span>
                    <span className="text-sm font-semibold text-warning">
                      {payments?.filter(p => p?.status === 'partial')?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Activité Récente</h3>
                <div className="space-y-3">
                  {payments?.slice(0, 3)?.map((payment, index) => (
                    <div key={payment?.id || index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        payment?.status === 'paid' ? 'bg-success' : 
                        payment?.status === 'overdue' ? 'bg-error' : 'bg-warning'
                      }`} />
                      <div className="text-xs">
                        <div className="text-foreground font-medium">
                          {payment?.status === 'paid' ? 'Paiement reçu' : 
                           payment?.status === 'overdue' ? 'Paiement en retard' : 'Paiement partiel'}
                        </div>
                        <div className="text-muted-foreground">
                          {payment?.student?.full_name || 'Étudiant'} - {payment?.amount || 0} FCFA
                        </div>
                        <div className="text-muted-foreground">
                          {payment?.created_at ? new Date(payment.created_at)?.toLocaleDateString('fr-FR') : 'Récemment'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!payments || payments?.length === 0) && !loading && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      Aucune activité récente
                    </div>
                  )}
                  
                  {loading && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Modals */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentCreated={handlePaymentUpdate}
      />
      <ReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        selectedPayments={selectedPayments}
        payments={payments}
      />
      <PaymentHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        paymentId={selectedPaymentId}
      />
    </div>
  );
};

export default PaymentManagement;