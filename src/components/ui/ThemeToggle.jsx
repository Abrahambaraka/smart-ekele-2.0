import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../AppIcon';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg hover:bg-muted transition-micro ${className}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <Icon 
        name={isDarkMode ? "Sun" : "Moon"} 
        size={20} 
        className="text-muted-foreground hover:text-foreground transition-micro" 
      />
    </button>
  );
};

export default ThemeToggle;