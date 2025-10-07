import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import QuickActionPanel from '../../components/ui/QuickActionPanel';
import NotificationFilters from './components/NotificationFilters';
import NotificationHistory from './components/NotificationHistory';
import NotificationComposer from './components/NotificationComposer';
import DeliveryTracking from './components/DeliveryTracking';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const NotificationCenter = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('history');
  const [filters, setFilters] = useState({});
  const [messageCount, setMessageCount] = useState(183);

  useEffect(() => {
    document.title = 'Centre de Notifications - Smart Ekele';
  }, []);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Apply filters to message count (mock implementation)
    const baseCount = 183;
    const hasActiveFilters = Object.values(newFilters)?.some(value => 
      value !== '' && value !== 'all'
    );
    setMessageCount(hasActiveFilters ? Math.floor(baseCount * 0.6) : baseCount);
  };

  const viewTabs = [
    {
      id: 'history',
      label: 'Historique',
      icon: 'History',
      description: 'Consulter les messages envoyés'
    },
    {
      id: 'compose',
      label: 'Composer',
      icon: 'Edit3',
      description: 'Créer un nouveau message'
    },
    {
      id: 'tracking',
      label: 'Suivi',
      icon: 'BarChart3',
      description: 'Analyser les performances'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={handleMenuToggle} 
        isMenuOpen={sidebarOpen} 
        onSidebarToggle={handleSidebarToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />
      
      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <BreadcrumbTrail />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Centre de Notifications
              </h1>
              <p className="text-muted-foreground">
                Gérez vos communications avec les parents, étudiants et personnel
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-muted-foreground">Messages envoyés aujourd'hui:</span>
                <span className="font-semibold text-foreground">47</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Taux de lecture:</span>
                <span className="font-semibold text-foreground">84%</span>
              </div>
            </div>
          </div>

          {/* View Tabs */}
          <div className="mb-6">
            <div className="border-b border-border">
              <nav className="flex space-x-8">
                {viewTabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveView(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeView === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span>{tab?.label}</span>
                    <span className="hidden sm:inline text-xs opacity-75">
                      - {tab?.description}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="xl:col-span-3">
              {activeView === 'history' && (
                <div className="space-y-6">
                  <NotificationFilters 
                    onFiltersChange={handleFiltersChange}
                    messageCount={messageCount}
                  />
                  <NotificationHistory filters={filters} />
                </div>
              )}

              {activeView === 'compose' && (
                <div className="h-[800px]">
                  <NotificationComposer />
                </div>
              )}

              {activeView === 'tracking' && (
                <DeliveryTracking />
              )}
            </div>

            {/* Sidebar Panel */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Actions */}
              <QuickActionPanel userRole="administrator" />

              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="Activity" size={18} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Activité Récente</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-foreground">
                        Message envoyé à 28 parents
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Il y a 15 minutes
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-foreground">
                        Nouveau modèle créé
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Il y a 1 heure
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-foreground">
                        4 messages en échec
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Il y a 2 heures
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  fullWidth 
                  className="mt-4"
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  Voir tout
                </Button>
              </div>

              {/* Communication Tips */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="Lightbulb" size={18} className="text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">Conseils</h3>
                </div>
                
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <Icon name="CheckCircle" size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span>Utilisez des objets clairs et concis</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="CheckCircle" size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span>Programmez vos messages aux heures optimales</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="CheckCircle" size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span>Personnalisez avec les variables disponibles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationCenter;