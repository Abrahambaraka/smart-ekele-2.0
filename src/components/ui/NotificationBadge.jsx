import React from 'react';

const NotificationBadge = ({ count = 0, size = 'default', className = '' }) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count?.toString();
  
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    default: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  const positionClasses = {
    sm: '-top-1 -right-1',
    default: '-top-2 -right-2',
    lg: '-top-2 -right-2'
  };

  return (
    <span 
      className={`
        absolute ${positionClasses?.[size]} ${sizeClasses?.[size]}
        bg-error text-error-foreground
        rounded-full flex items-center justify-center
        font-medium leading-none
        animate-pulse
        ${className}
      `}
      aria-label={`${count} notifications non lues`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;