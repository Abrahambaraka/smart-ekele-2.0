import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import NotificationBadge from './NotificationBadge';

const Sidebar = ({ isCollapsed = false, isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationCount] = useState(3);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: 'LayoutDashboard',
      path: '/administrator-dashboard',
      description: 'Vue d\'ensemble administrative'
    },
    {
      id: 'users',
      label: 'Gestion des Utilisateurs',
      icon: 'Users',
      path: '/user-management',
      description: 'Gestion des comptes utilisateurs'
    },
    {
      id: 'classes',
      label: 'Gestion des Classes',
      icon: 'BookOpen',
      path: '/class-management',
      description: 'Organisation des classes'
    },
    {
      id: 'students',
      label: 'Gestion des Étudiants',
      icon: 'UserCheck',
      path: '/student-management',
      description: 'Suivi des étudiants'
    },
    {
      id: 'payments',
      label: 'Gestion Financière',
      icon: 'CreditCard',
      path: '/payment-management',
      description: 'Suivi des paiements'
    },
    {
      id: 'notifications',
      label: 'Communications',
      icon: 'MessageSquare',
      path: '/notification-center',
      description: 'Centre de notifications',
      badge: notificationCount
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: 'BarChart3',
      path: '/reports-dashboard',
      description: 'Analyses et rapports'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => location?.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-200"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-card border-r border-border z-300
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${isCollapsed ? 'w-16' : 'w-60'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center h-16 px-4 border-b border-border">
            {!isCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="GraduationCap" size={20} className="text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">Smart Ekele</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Icon name="GraduationCap" size={20} className="text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems?.map((item) => (
              <button
                key={item?.id}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                  transition-micro hover-lift
                  ${isActive(item?.path) 
                    ? 'bg-primary text-primary-foreground elevation-1' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                `}
                title={isCollapsed ? item?.label : ''}
              >
                <div className="relative flex-shrink-0">
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    className={isActive(item?.path) ? 'text-primary-foreground' : 'current'}
                  />
                  {item?.badge && item?.badge > 0 && !isCollapsed && (
                    <NotificationBadge count={item?.badge} size="sm" />
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{item?.label}</div>
                    <div className="text-xs opacity-75 mt-0.5">{item?.description}</div>
                  </div>
                )}

                {!isCollapsed && item?.badge && item?.badge > 0 && (
                  <NotificationBadge count={item?.badge} size="sm" />
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {!isCollapsed ? (
              <div className="text-xs text-muted-foreground text-center">
                Smart Ekele v2.1.0
                <br />
                © 2025 Tous droits réservés
              </div>
            ) : (
              <div className="w-2 h-2 bg-success rounded-full mx-auto" title="Système actif" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;