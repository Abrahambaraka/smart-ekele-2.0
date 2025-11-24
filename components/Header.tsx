
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  
  const getRoleName = (role: string | undefined) => {
    if (!role) return '';
    switch (role) {
      case 'super_admin': return 'Super Administrateur';
      case 'school_director': return 'Directeur d\'École';
      case 'teacher': return 'Professeur';
      default: return '';
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500 dark:text-slate-300 focus:outline-none lg:hidden">
                <i className="fa-solid fa-bars h-6 w-6"></i>
            </button>
        </div>
        <div className="flex items-center">
            <div className="hidden sm:flex flex-col items-end">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{getRoleName(user?.role)}</span>
            </div>
            <img className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover ml-3" src={`https://i.pravatar.cc/150?u=${user?.email}`} alt="User avatar" />
        </div>
    </header>
  );
};

export default Header;