import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportCategoryCard = ({ category, onSelect, isSelected = false }) => {
  const {
    id,
    title,
    description,
    icon,
    reportCount,
    lastGenerated,
    color = 'primary'
  } = category;

  const colorClasses = {
    primary: 'bg-primary/10 border-primary/20 text-primary',
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    error: 'bg-error/10 border-error/20 text-error',
    secondary: 'bg-secondary/10 border-secondary/20 text-secondary'
  };

  return (
    <div className={`
      bg-card border rounded-lg p-6 transition-smooth hover-lift cursor-pointer
      ${isSelected ? 'border-primary elevation-2' : 'border-border hover:border-primary/50'}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${colorClasses?.[color]}
        `}>
          <Icon name={icon} size={24} />
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{reportCount}</div>
          <div className="text-xs text-muted-foreground">rapports</div>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Dernière génération: {lastGenerated}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          iconName="ArrowRight"
          iconPosition="right"
          onClick={() => onSelect(category)}
        >
          Voir les rapports
        </Button>
      </div>
    </div>
  );
};

export default ReportCategoryCard;