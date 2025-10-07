import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStats = () => {
  const stats = [
    {
      id: 'attendance',
      label: 'Présence Aujourd\'hui',
      value: '92%',
      subValue: '335/365 étudiants',
      icon: 'UserCheck',
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: '+2.3%'
    },
    {
      id: 'teachers',
      label: 'Enseignants Actifs',
      value: '28',
      subValue: '2 en congé',
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: 'stable'
    },
    {
      id: 'classes',
      label: 'Classes en Cours',
      value: '15',
      subValue: '3 salles libres',
      icon: 'BookOpen',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: '+1'
    },
    {
      id: 'pending',
      label: 'Tâches en Attente',
      value: '7',
      subValue: '2 urgentes',
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: '-3'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats?.map((stat) => (
        <div 
          key={stat?.id}
          className="bg-card border border-border rounded-lg p-4 hover-lift transition-smooth cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            {stat?.trend !== 'stable' && (
              <div className={`text-xs px-2 py-1 rounded-full ${
                stat?.trend?.startsWith('+') ? 'bg-success/10 text-success' : 
                stat?.trend?.startsWith('-') ? 'bg-error/10 text-error' : 
                'bg-muted text-muted-foreground'
              }`}>
                {stat?.trend}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {stat?.value}
            </div>
            <div className="text-sm font-medium text-foreground">
              {stat?.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {stat?.subValue}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;