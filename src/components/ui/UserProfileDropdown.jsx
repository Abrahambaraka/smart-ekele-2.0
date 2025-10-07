import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Image from '../AppImage';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mock user data
  const user = {
    name: 'Marie Dubois',
    email: 'marie.dubois@smartekele.fr',
    role: 'Administrateur',
    avatar: '/assets/images/avatar-placeholder.jpg'
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: 'User',
      action: () => console.log('Profile clicked')
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: 'Settings',
      action: () => console.log('Settings clicked')
    },
    {
      id: 'help',
      label: 'Aide & Support',
      icon: 'HelpCircle',
      action: () => console.log('Help clicked')
    },
    {
      id: 'logout',
      label: 'Se Déconnecter',
      icon: 'LogOut',
      action: () => console.log('Logout clicked'),
      variant: 'destructive'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    item?.action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-micro"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
          <Image
            src={user?.avatar}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-foreground">{user?.name}</div>
          <div className="text-xs text-muted-foreground">{user?.role}</div>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg elevation-2 z-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                <Image
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-popover-foreground truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
                <div className="text-xs text-primary font-medium">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems?.map((item) => (
              <button
                key={item?.id}
                onClick={() => handleItemClick(item)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-2.5 text-left
                  transition-micro hover:bg-muted
                  ${item?.variant === 'destructive' ?'text-destructive hover:bg-destructive/10' :'text-popover-foreground'
                  }
                `}
              >
                <Icon 
                  name={item?.icon} 
                  size={16} 
                  className={item?.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}
                />
                <span className="text-sm">{item?.label}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Dernière connexion: Aujourd'hui à 09:15
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;