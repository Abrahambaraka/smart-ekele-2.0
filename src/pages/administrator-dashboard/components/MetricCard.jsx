import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description,
  onClick,
  loading = false 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'warning': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return 'TrendingUp';
      case 'negative': return 'TrendingDown';
      case 'warning': return 'AlertTriangle';
      default: return 'Minus';
    }
  };

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 hover-lift transition-smooth ${
        onClick ? 'cursor-pointer hover:border-primary/20' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground/70">{description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-20 mb-2"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {change && (
              <div className={`flex items-center space-x-1 text-sm ${getChangeColor()}`}>
                <Icon name={getChangeIcon()} size={14} />
                <span>{change}</span>
                <span className="text-muted-foreground">ce mois</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MetricCard;