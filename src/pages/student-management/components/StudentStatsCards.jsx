import React from 'react';
import Icon from '../../../components/AppIcon';

const StudentStatsCards = ({ students }) => {
  const totalStudents = students?.length;
  const activeStudents = students?.filter(s => s?.status === 'Actif')?.length;
  const inactiveStudents = students?.filter(s => s?.status === 'Inactif')?.length;
  const suspendedStudents = students?.filter(s => s?.status === 'Suspendu')?.length;
  const graduatedStudents = students?.filter(s => s?.status === 'Diplômé')?.length;
  
  const upToDatePayments = students?.filter(s => s?.paymentStatus === 'À jour')?.length;
  const latePayments = students?.filter(s => s?.paymentStatus === 'En retard')?.length;
  const partialPayments = students?.filter(s => s?.paymentStatus === 'Partiel')?.length;

  const stats = [
    {
      title: 'Total Étudiants',
      value: totalStudents,
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Tous les étudiants'
    },
    {
      title: 'Étudiants Actifs',
      value: activeStudents,
      icon: 'UserCheck',
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'Actuellement inscrits'
    },
    {
      title: 'Paiements à Jour',
      value: upToDatePayments,
      icon: 'CheckCircle',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      description: 'Frais payés'
    },
    {
      title: 'Paiements en Retard',
      value: latePayments,
      icon: 'AlertTriangle',
      color: 'text-error',
      bgColor: 'bg-error/10',
      description: 'Nécessitent un suivi'
    }
  ];

  const detailedStats = [
    { label: 'Actifs', value: activeStudents, color: 'text-success' },
    { label: 'Inactifs', value: inactiveStudents, color: 'text-muted-foreground' },
    { label: 'Suspendus', value: suspendedStudents, color: 'text-warning' },
    { label: 'Diplômés', value: graduatedStudents, color: 'text-accent' }
  ];

  const paymentStats = [
    { label: 'À jour', value: upToDatePayments, color: 'text-success' },
    { label: 'En retard', value: latePayments, color: 'text-error' },
    { label: 'Partiel', value: partialPayments, color: 'text-warning' }
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat?.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat?.description}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
                <Icon name={stat?.icon} size={24} className={stat?.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="PieChart" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Répartition par Statut</h3>
          </div>
          <div className="space-y-3">
            {detailedStats?.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    stat?.label === 'Actifs' ? 'bg-success' :
                    stat?.label === 'Inactifs' ? 'bg-muted-foreground' :
                    stat?.label === 'Suspendus'? 'bg-warning' : 'bg-accent'
                  }`} />
                  <span className="text-sm text-foreground">{stat?.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${stat?.color}`}>{stat?.value}</span>
                  <span className="text-xs text-muted-foreground">
                    ({totalStudents > 0 ? Math.round((stat?.value / totalStudents) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="CreditCard" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Statut des Paiements</h3>
          </div>
          <div className="space-y-3">
            {paymentStats?.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    stat?.label === 'À jour' ? 'bg-success' :
                    stat?.label === 'En retard'? 'bg-error' : 'bg-warning'
                  }`} />
                  <span className="text-sm text-foreground">{stat?.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${stat?.color}`}>{stat?.value}</span>
                  <span className="text-xs text-muted-foreground">
                    ({totalStudents > 0 ? Math.round((stat?.value / totalStudents) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStatsCards;