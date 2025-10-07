import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = ({ customBreadcrumbs = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route mapping for breadcrumbs
  const routeMap = {
    '/administrator-dashboard': { label: 'Tableau de Bord', icon: 'LayoutDashboard' },
    '/user-management': { label: 'Gestion des Utilisateurs', icon: 'Users' },
    '/class-management': { label: 'Gestion des Classes', icon: 'BookOpen' },
    '/student-management': { label: 'Gestion des Étudiants', icon: 'UserCheck' },
    '/payment-management': { label: 'Gestion Financière', icon: 'CreditCard' },
    '/notification-center': { label: 'Communications', icon: 'MessageSquare' },
    '/reports-dashboard': { label: 'Rapports', icon: 'BarChart3' }
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs;

    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [
      { label: 'Accueil', path: '/administrator-dashboard', icon: 'Home' }
    ];

    let currentPath = '';
    pathSegments?.forEach((segment) => {
      currentPath += `/${segment}`;
      const route = routeMap?.[currentPath];
      if (route) {
        breadcrumbs?.push({
          label: route?.label,
          path: currentPath,
          icon: route?.icon
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) return null;

  const handleNavigation = (path) => {
    if (path !== location?.pathname) {
      navigate(path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Fil d'Ariane">
      {breadcrumbs?.map((crumb, index) => (
        <div key={crumb?.path || index} className="flex items-center space-x-2">
          {index > 0 && (
            <Icon name="ChevronRight" size={14} className="text-muted-foreground/50" />
          )}
          
          {index === breadcrumbs?.length - 1 ? (
            // Current page - not clickable
            (<div className="flex items-center space-x-1.5 text-foreground font-medium">
              {crumb?.icon && (
                <Icon name={crumb?.icon} size={14} className="text-primary" />
              )}
              <span>{crumb?.label}</span>
            </div>)
          ) : (
            // Clickable breadcrumb
            (<button
              onClick={() => handleNavigation(crumb?.path)}
              className="flex items-center space-x-1.5 hover:text-foreground transition-micro"
            >
              {crumb?.icon && (
                <Icon name={crumb?.icon} size={14} />
              )}
              <span>{crumb?.label}</span>
            </button>)
          )}
        </div>
      ))}
    </nav>
  );
};

export default BreadcrumbTrail;