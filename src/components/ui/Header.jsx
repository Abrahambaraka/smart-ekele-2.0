import React, { useState } from 'react';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationBadge from './NotificationBadge';
import ThemeToggle from './ThemeToggle';

const Header = ({ onMenuToggle, isMenuOpen = false, onSidebarToggle, sidebarCollapsed = false }) => {
  const [notificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    {
      id: 1,
      title: 'Nouveau message de parent',
      description: 'Marie Dubois demande des informations sur les devoirs',
      time: '5 min',
      unread: true
    },
    {
      id: 2,
      title: 'Paiement reçu',
      description: 'Frais de scolarité - Classe 6ème A',
      time: '2h',
      unread: true
    },
    {
      id: 3,
      title: 'Nouveau étudiant inscrit',
      description: 'Pierre Martin - Classe 5ème B',
      time: '1 jour',
      unread: false
    }
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-100">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-micro"
            aria-label="Toggle menu"
          >
            <Icon 
              name={isMenuOpen ? "X" : "Menu"} 
              size={24} 
              className="text-foreground"
            />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={onSidebarToggle}
            className="hidden lg:flex p-2 rounded-lg hover:bg-muted transition-micro"
            aria-label="Toggle sidebar"
            title={sidebarCollapsed ? "Étendre la barre latérale" : "Réduire la barre latérale"}
          >
            <Icon 
              name={sidebarCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} 
              size={20} 
              className="text-muted-foreground hover:text-foreground"
            />
          </button>

          {/* Logo - Desktop Only */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={20} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Smart Ekele</span>
            </div>
          </div>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={16} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Smart Ekele</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-micro relative"
              onClick={handleNotificationClick}
              title="Notifications"
            >
              <Icon name="Bell" size={20} className="text-muted-foreground" />
              {notificationCount > 0 && (
                <NotificationBadge count={notificationCount} />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => setShowNotifications(false)}
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications?.map((notification) => (
                    <div 
                      key={notification?.id}
                      className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer ${
                        notification?.unread ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification?.unread ? 'bg-primary' : 'bg-muted'
                        }`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {notification?.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification?.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {notification?.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 border-t border-border">
                  <button 
                    className="w-full text-center text-sm text-primary hover:underline"
                    onClick={() => {
                      setShowNotifications(false);
                      window.location.href = '/notification-center';
                    }}
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;