
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const SchoolDirectorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        revenue: 0,
        schoolName: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.schoolId) return;

            setLoading(true);
            
            // 1. School Info
            const schoolRef = doc(db, "schools", String(user.schoolId));
            const schoolSnap = await getDoc(schoolRef);
            const schoolName = schoolSnap.exists() ? schoolSnap.data().name : 'École';
            
            // 2. Counts - Note: Firestore count aggregation is best, but getDocs.size is easier for this scale
            const qStudents = query(collection(db, "students"), where("school_id", "==", user.schoolId));
            const snapStudents = await getDocs(qStudents);

            const qTeachers = query(collection(db, "users"), where("school_id", "==", user.schoolId), where("role", "==", "teacher"));
            const snapTeachers = await getDocs(qTeachers);

            const qClasses = query(collection(db, "classes"), where("school_id", "==", user.schoolId));
            const snapClasses = await getDocs(qClasses);
            
            // 3. Revenue (Sum of 'Payé')
            const qPayments = query(collection(db, "payments"), where("school_id", "==", user.schoolId), where("status", "==", "Payé"));
            const snapPayments = await getDocs(qPayments);

            const totalRevenue = snapPayments.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);

            setStats({
                students: snapStudents.size,
                teachers: snapTeachers.size,
                classes: snapClasses.size,
                revenue: totalRevenue,
                schoolName: schoolName
            });
            setLoading(false);
        };

        fetchStats();
    }, [user?.schoolId]);

    // Placeholder chart data (could be real later via aggregations)
    const monthlyPaymentsData = [
        { name: 'Juil', 'Paiements': 0 }, { name: 'Août', 'Paiements': 0 },
        { name: 'Sep', 'Paiements': stats.revenue * 0.3 }, { name: 'Oct', 'Paiements': stats.revenue * 0.2 },
    ];

    const quickLinks = [
        { path: '/student-management', label: 'Gestion Étudiants', icon: 'fas fa-user-graduate' },
        { path: '/payment-management', label: 'Gestion Financière', icon: 'fas fa-file-invoice-dollar' },
        { path: '/class-management', label: 'Gestion des Classes', icon: 'fas fa-chalkboard-user' },
    ];

    if (loading) return <div className="container mx-auto p-8">Chargement des données...</div>;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Tableau de Bord: {stats.schoolName}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <DashboardCard title="Étudiants Inscrits" value={stats.students} icon={<i className="fas fa-user-graduate"></i>} color="bg-gradient-to-br from-blue-400 to-blue-600" />
                <DashboardCard title="Enseignants" value={stats.teachers} icon={<i className="fas fa-chalkboard-user"></i>} color="bg-gradient-to-br from-green-400 to-green-600" />
                <DashboardCard title="Classes" value={stats.classes} icon={<i className="fas fa-chalkboard"></i>} color="bg-gradient-to-br from-purple-400 to-purple-600" />
                <DashboardCard title="Revenu (Payé)" value={`$${stats.revenue.toLocaleString()}`} icon={<i className="fas fa-dollar-sign"></i>} color="bg-gradient-to-br from-yellow-400 to-yellow-600" />
            </div>

            <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Aperçu Financier</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyPaymentsData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="Paiements" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Accès Rapide</h2>
                        <div className="space-y-2">
                            {quickLinks.map(link => (
                                <Link key={link.path} to={link.path} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium text-slate-700 dark:text-slate-200">
                                    <i className={`${link.icon} w-6 text-center text-slate-500 dark:text-slate-400 mr-3`}></i>
                                    <span>{link.label}</span>
                                    <i className="fas fa-chevron-right ml-auto text-xs text-slate-400"></i>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolDirectorDashboard;
