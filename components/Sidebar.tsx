import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NAVIGATION_LINKS } from '../constants';
import { Role } from '../types';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const SettingsIcon = () => <i className="fa-solid fa-cog w-6 h-6"></i>;

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = user ? NAVIGATION_LINKS[user.role as Role] : [];

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`transform top-0 left-0 w-64 bg-white dark:bg-slate-800 fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 shadow-lg ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-20 border-b dark:border-slate-700">
            <h1 className="text-2xl font-bold text-brand-primary dark:text-blue-400">
                <i className="fas fa-graduation-cap mr-2"></i>Smart Ekele
            </h1>
        </div>
        <nav className="mt-4 flex-1 px-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center mt-2 py-2.5 px-4 rounded-md transition-colors duration-200 group font-medium ${
                  isActive 
                  ? 'bg-brand-primary text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`
              }
            >
              <span>
                {link.icon}
              </span>
              <span className="mx-4">{link.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-2">
            <NavLink
              to="/settings"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center w-full mb-2 py-2.5 px-4 rounded-md transition-colors duration-200 group font-medium ${
                  isActive 
                  ? 'bg-brand-primary text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`
              }
            >
              <span><SettingsIcon /></span>
              <span className="mx-4">Paramètres</span>
            </NavLink>
            <button 
              onClick={handleLogout} 
              className="flex items-center w-full py-2.5 px-4 rounded-md text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 font-medium group"
            >
                <i className="fa-solid fa-right-from-bracket w-6 h-6"></i>
                <span className="mx-4">Déconnexion</span>
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;