import React from 'react';
import Icon from '../../../components/AppIcon';

const ClassStatsCards = ({ classes }) => {
  const stats = {
    totalClasses: classes?.length,
    activeClasses: classes?.filter(c => c?.status === 'active')?.length,
    totalStudents: classes?.reduce((sum, c) => sum + c?.studentCount, 0),
    averageCapacity: classes?.length > 0 
      ? Math.round(classes?.reduce((sum, c) => sum + (c?.studentCount / c?.capacity * 100), 0) / classes?.length)
      : 0
  };

  const cards = [
    {
      id: 'total',
      title: 'Total des Classes',
      value: stats?.totalClasses,
      icon: 'BookOpen',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Classes créées'
    },
    {
      id: 'active',
      title: 'Classes Actives',
      value: stats?.activeClasses,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'En cours'
    },
    {
      id: 'students',
      title: 'Total Étudiants',
      value: stats?.totalStudents,
      icon: 'Users',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      description: 'Inscrits'
    },
    {
      id: 'capacity',
      title: 'Taux de Remplissage',
      value: `${stats?.averageCapacity}%`,
      icon: 'TrendingUp',
      color: stats?.averageCapacity >= 80 ? 'text-warning' : 'text-muted-foreground',
      bgColor: stats?.averageCapacity >= 80 ? 'bg-warning/10' : 'bg-muted/10',
      description: 'Capacité moyenne'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards?.map((card) => (
        <div
          key={card?.id}
          className="bg-card border border-border rounded-lg p-6 hover-lift transition-smooth"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card?.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={card?.icon} size={24} className={card?.color} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{card?.value}</div>
              <div className="text-xs text-muted-foreground">{card?.description}</div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{card?.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Mis à jour: {new Date()?.toLocaleDateString('fr-FR')}
              </span>
              {card?.id === 'capacity' && (
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      stats?.averageCapacity >= 80 ? 'bg-warning' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(stats?.averageCapacity, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassStatsCards;