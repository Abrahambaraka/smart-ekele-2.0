
import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { School } from '../types';

const SuperAdminDashboard: React.FC = () => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const unsub = onSnapshot(
                collection(db, 'schools'),
                (snap) => {
                    const data: School[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as School[];
                    setSchools(data);
                    setLoading(false);
                },
                (e) => {
                    setError(e?.message || 'Erreur de chargement');
                    setLoading(false);
                }
            );
            return () => unsub();
        } catch (e: any) {
            setError(e?.message || 'Erreur de chargement');
            setLoading(false);
        }
    }, []);

    const totalStudents = useMemo(() => schools.reduce((sum, school) => sum + (Number((school as any).studentCount) || 0), 0), [schools]);
    const totalTeachers = useMemo(() => schools.reduce((sum, school) => sum + (Number((school as any).teacherCount) || 0), 0), [schools]);
    const activeSchools = useMemo(() => schools.filter(s => (s as any).status === 'Active').length, [schools]);

    const chartData = useMemo(() => schools.map(school => ({
        name: (school.name || '').toString().split(' ')[0],
        Étudiants: Number((school as any).studentCount) || 0,
        Professeurs: Number((school as any).teacherCount) || 0
    })), [schools]);

  return (
    <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Tableau de Bord Global</h1>
        {loading && (
            <div className="mb-6 text-slate-500 dark:text-slate-400">Chargement des écoles…</div>
        )}
        {error && (
            <div className="mb-6 text-red-600">{error}</div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <DashboardCard title="Écoles Actives" value={activeSchools} icon={<i className="fas fa-school"></i>} color="bg-gradient-to-br from-blue-400 to-blue-600" />
            <DashboardCard title="Total Étudiants" value={totalStudents.toLocaleString()} icon={<i className="fas fa-user-graduate"></i>} color="bg-gradient-to-br from-green-400 to-green-600" />
            <DashboardCard title="Total Professeurs" value={totalTeachers.toLocaleString()} icon={<i className="fas fa-chalkboard-user"></i>} color="bg-gradient-to-br from-purple-400 to-purple-600" />
            <DashboardCard title="Taux d'Activité" value={`${(schools.length ? ((activeSchools/Math.max(schools.length,1))*100) : 0).toFixed(0)}%`} icon={<i className="fas fa-chart-line"></i>} color="bg-gradient-to-br from-orange-400 to-orange-600" />
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
                            {schools.map(school => (
                                <tr key={school.id} className="border-b dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium">{school.name}</td>
                                    <td className="p-3">{(school as any).studentCount || 0}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${(school as any).status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{(school as any).status || 'Inactive'}</span>
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