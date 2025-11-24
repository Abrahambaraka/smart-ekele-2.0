
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { MOCK_SCHOOLS } from '../constants';

const SuperAdminDashboard: React.FC = () => {
    const totalStudents = MOCK_SCHOOLS.reduce((sum, school) => sum + (school.studentCount || 0), 0);
    const totalTeachers = MOCK_SCHOOLS.reduce((sum, school) => sum + (school.teacherCount || 0), 0);
    const activeSchools = MOCK_SCHOOLS.filter(s => s.status === 'Active').length;

    const chartData = MOCK_SCHOOLS.map(school => ({
        name: school.name.split(' ')[0],
        Étudiants: school.studentCount || 0,
        Professeurs: school.teacherCount || 0
    }));

  return (
    <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Tableau de Bord Global</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <DashboardCard title="Écoles Actives" value={activeSchools} icon={<i className="fas fa-school"></i>} color="bg-gradient-to-br from-blue-400 to-blue-600" />
            <DashboardCard title="Total Étudiants" value={totalStudents.toLocaleString()} icon={<i className="fas fa-user-graduate"></i>} color="bg-gradient-to-br from-green-400 to-green-600" />
            <DashboardCard title="Total Professeurs" value={totalTeachers.toLocaleString()} icon={<i className="fas fa-chalkboard-user"></i>} color="bg-gradient-to-br from-purple-400 to-purple-600" />
            <DashboardCard title="Taux d'Activité" value={`${((activeSchools/MOCK_SCHOOLS.length)*100).toFixed(0)}%`} icon={<i className="fas fa-chart-line"></i>} color="bg-gradient-to-br from-orange-400 to-orange-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Statistiques par École</h2>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis />
                        <Tooltip 
                            cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}
                            contentStyle={{ backgroundColor: 'var(--color-slate-800)', border: 'none', borderRadius: '0.5rem', color: 'white' }} 
                         />
                        <Legend />
                        <Bar dataKey="Étudiants" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Professeurs" fill="var(--color-secondary-500)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Liste des Écoles</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-style text-sm">
                        <thead>
                            <tr>
                                <th className="p-3 font-semibold">Nom</th>
                                <th className="p-3 font-semibold">Étudiants</th>
                                <th className="p-3 font-semibold">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_SCHOOLS.map(school => (
                                <tr key={school.id} className="border-b dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium">{school.name}</td>
                                    <td className="p-3">{school.studentCount || 0}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${school.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{school.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SuperAdminDashboard;