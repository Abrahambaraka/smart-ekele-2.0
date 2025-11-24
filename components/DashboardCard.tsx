
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  // Fix: Change prop type to React.ReactNode to avoid issues with the JSX namespace.
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 md:p-6 flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div>
        <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <div className={`text-xl md:text-2xl text-white rounded-full p-3 md:p-4 ${color}`}>
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;