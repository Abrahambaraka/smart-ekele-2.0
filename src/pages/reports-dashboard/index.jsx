import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ReportCategoryCard from './components/ReportCategoryCard';
import ReportViewer from './components/ReportViewer';
import ReportFilters from './components/ReportFilters';
import ExportModal from './components/ExportModal';
import SavedReportsPanel from './components/SavedReportsPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ReportsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('categories'); // categories, viewer, saved

  // Mock report categories data
  const reportCategories = [
    {
      id: 'academic',
      title: 'Performance Académique',
      description: 'Analyses des résultats scolaires, notes moyennes, et progression des étudiants par classe et matière.',
      icon: 'BookOpen',
      reportCount: 12,
      lastGenerated: '14/09/2025',
      color: 'primary'
    },
    {
      id: 'attendance',
      title: 'Suivi de Présence',
      description: 'Statistiques de présence, absences justifiées et non justifiées, tendances par période.',
      icon: 'Clock',
      reportCount: 8,
      lastGenerated: '15/09/2025',
      color: 'success'
    },
    {
      id: 'financial',
      title: 'Résumés Financiers',
      description: 'Suivi des paiements de scolarité, revenus mensuels, créances et analyses budgétaires.',
      icon: 'CreditCard',
      reportCount: 15,
      lastGenerated: '13/09/2025',
      color: 'warning'
    },
    {
      id: 'enrollment',
      title: 'Statistiques d\'Inscription',
      description: 'Évolution des inscriptions, répartition par classe, nouveaux étudiants et réinscriptions.',
      icon: 'UserPlus',
      reportCount: 6,
      lastGenerated: '12/09/2025',
      color: 'secondary'
    },
    {
      id: 'administrative',
      title: 'Audit Administratif',
      description: 'Journaux d\'activité, actions utilisateurs, modifications système et conformité.',
      icon: 'Shield',
      reportCount: 9,
      lastGenerated: '11/09/2025',
      color: 'error'
    }
  ];

  // Mock detailed report data
  const generateMockReport = (categoryId) => {
    const reportTemplates = {
      academic: {
        title: 'Rapport de Performance Académique',
        description: 'Analyse détaillée des résultats scolaires du mois de septembre 2025',
        chartType: 'bar',
        data: [
          { name: 'CP1', value: 14.2 },
          { name: 'CP2', value: 13.8 },
          { name: 'CE1', value: 15.1 },
          { name: 'CE2', value: 14.7 },
          { name: 'CM1', value: 13.9 },
          { name: 'CM2', value: 15.3 }
        ],
        tableData: {
          headers: ['Classe', 'Moyenne Générale', 'Nb Étudiants', 'Taux Réussite', 'Évolution'],
          rows: [
            ['CP1', '14.2/20', '28', '89%', '+0.3'],
            ['CP2', '13.8/20', '32', '85%', '-0.1'],
            ['CE1', '15.1/20', '29', '93%', '+0.7'],
            ['CE2', '14.7/20', '31', '91%', '+0.2'],
            ['CM1', '13.9/20', '27', '87%', '+0.1'],
            ['CM2', '15.3/20', '25', '96%', '+0.5']
          ]
        }
      },
      attendance: {
        title: 'Rapport de Présence',
        description: 'Statistiques de présence pour la période du 1er au 15 septembre 2025',
        chartType: 'line',
        data: [
          { name: 'Sem 1', value: 94 },
          { name: 'Sem 2', value: 92 },
          { name: 'Sem 3', value: 96 },
          { name: 'Sem 4', value: 91 },
          { name: 'Sem 5', value: 95 }
        ],
        tableData: {
          headers: ['Période', 'Taux Présence', 'Absences Justifiées', 'Absences Non Justifiées', 'Total Étudiants'],
          rows: [
            ['Semaine 1', '94%', '12', '3', '172'],
            ['Semaine 2', '92%', '18', '6', '172'],
            ['Semaine 3', '96%', '8', '1', '172'],
            ['Semaine 4', '91%', '22', '4', '172'],
            ['Semaine 5', '95%', '14', '2', '172']
          ]
        }
      },
      financial: {
        title: 'Rapport Financier',
        description: 'Analyse des revenus et paiements pour septembre 2025',
        chartType: 'pie',
        data: [
          { name: 'Scolarité', value: 85000 },
          { name: 'Inscription', value: 12000 },
          { name: 'Activités', value: 8500 },
          { name: 'Cantine', value: 15000 },
          { name: 'Transport', value: 6500 }
        ],
        tableData: {
          headers: ['Type de Paiement', 'Montant (€)', 'Nb Transactions', 'Taux Collection', 'En Attente'],
          rows: [
            ['Frais de Scolarité', '85 000 €', '156', '91%', '8 500 €'],
            ['Frais d\'Inscription', '12 000 €', '48', '96%', '500 €'],
            ['Activités Extra', '8 500 €', '72', '88%', '1 200 €'],
            ['Cantine', '15 000 €', '134', '93%', '1 100 €'],
            ['Transport', '6 500 €', '45', '85%', '1 000 €']
          ]
        }
      }
    };

    const template = reportTemplates?.[categoryId] || reportTemplates?.academic;
    
    return {
      id: `report_${categoryId}_${Date.now()}`,
      categoryId,
      generatedDate: '15/09/2025',
      lastUpdated: '15/09/2025 11:31',
      dataPoints: template?.data?.length,
      ...template
    };
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const mockReport = generateMockReport(category?.id);
    setSelectedReport(mockReport);
    setViewMode('viewer');
  };

  const handleExport = (reportData) => {
    console.log('Exporting report:', reportData);
    // Simulate file download
    const blob = new Blob(['Mock report data'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportData?.filename || 'rapport.pdf';
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // In a real app, this would trigger data refetch
    console.log('Filters updated:', newFilters);
  };

  const handleLoadSavedReport = (savedReport) => {
    const mockReport = generateMockReport(savedReport?.category);
    setSelectedReport({
      ...mockReport,
      title: savedReport?.name,
      description: savedReport?.description
    });
    setViewMode('viewer');
  };

  const handleDeleteSavedReport = (reportId) => {
    console.log('Deleting saved report:', reportId);
    // In a real app, this would delete from backend
  };

  useEffect(() => {
    document.title = 'Rapports - Smart Ekele';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
      />
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className={`
        transition-all duration-300 pt-16
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}>
        <div className="p-6">
          <BreadcrumbTrail />
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Tableau de Bord des Rapports
              </h1>
              <p className="text-muted-foreground">
                Analyses complètes et visualisations de données pour la prise de décision éclairée
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('categories')}
                  className={`px-3 py-2 text-sm rounded transition-micro ${
                    viewMode === 'categories' ?'bg-card text-foreground elevation-1' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="Grid3x3" size={16} className="mr-1.5" />
                  Catégories
                </button>
                <button
                  onClick={() => setViewMode('saved')}
                  className={`px-3 py-2 text-sm rounded transition-micro ${
                    viewMode === 'saved' ?'bg-card text-foreground elevation-1' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="Save" size={16} className="mr-1.5" />
                  Sauvegardés
                </button>
              </div>
              
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
              >
                Nouveau Rapport
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Filters */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <ReportFilters 
                  onFiltersChange={handleFiltersChange}
                  onReset={() => setFilters({})}
                />
                
                {viewMode === 'saved' && (
                  <SavedReportsPanel
                    onLoadReport={handleLoadSavedReport}
                    onDeleteReport={handleDeleteSavedReport}
                  />
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {viewMode === 'categories' && (
                <div>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-foreground">50</div>
                          <div className="text-sm text-muted-foreground">Rapports Totaux</div>
                        </div>
                        <Icon name="FileText" size={24} className="text-primary" />
                      </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-foreground">12</div>
                          <div className="text-sm text-muted-foreground">Cette Semaine</div>
                        </div>
                        <Icon name="TrendingUp" size={24} className="text-success" />
                      </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-foreground">8</div>
                          <div className="text-sm text-muted-foreground">Programmés</div>
                        </div>
                        <Icon name="Calendar" size={24} className="text-warning" />
                      </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-foreground">95%</div>
                          <div className="text-sm text-muted-foreground">Précision</div>
                        </div>
                        <Icon name="Target" size={24} className="text-error" />
                      </div>
                    </div>
                  </div>

                  {/* Report Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportCategories?.map((category) => (
                      <ReportCategoryCard
                        key={category?.id}
                        category={category}
                        onSelect={handleCategorySelect}
                        isSelected={selectedCategory?.id === category?.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {viewMode === 'viewer' && (
                <ReportViewer
                  selectedReport={selectedReport}
                  onExport={(report) => {
                    setShowExportModal(true);
                  }}
                  onClose={() => {
                    setViewMode('categories');
                    setSelectedReport(null);
                    setSelectedCategory(null);
                  }}
                />
              )}

              {viewMode === 'saved' && (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Icon name="Save" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Rapports Sauvegardés
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Consultez vos rapports sauvegardés dans le panneau de gauche
                  </p>
                  <Button
                    variant="outline"
                    iconName="ArrowLeft"
                    iconPosition="left"
                    onClick={() => setViewMode('categories')}
                  >
                    Retour aux Catégories
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        reportData={selectedReport}
        onExport={handleExport}
      />
    </div>
  );
};

export default ReportsDashboard;