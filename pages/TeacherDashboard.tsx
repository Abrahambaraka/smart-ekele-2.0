
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardCard from '../components/DashboardCard';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface TeacherClass {
    id: string;
    name: string;
    level: string;
    student_count?: number;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchMyClasses = async () => {
          if (!user?.id || !user?.schoolId) return;
          
          // Note: In Firestore, queries for assigned classes
          // Assuming classes have 'teacher_id' field.
          
          const q = query(
              collection(db, "classes"), 
              where("school_id", "==", user.schoolId),
              where("teacher_id", "==", user.id)
          );
          
          const querySnapshot = await getDocs(q);
          const classList: any[] = [];
          
          querySnapshot.forEach((doc) => {
             classList.push({ id: doc.id, ...doc.data() });
          });

          if (classList.length > 0) {
             // Count students for these classes
             const classesWithCounts = await Promise.all(classList.map(async (cls) => {
                  const qStudents = query(collection(db, "students"), where("class_id", "==", cls.id));
                  const snap = await getDocs(qStudents);
                  return { ...cls, student_count: snap.size };
             }));
             setMyClasses(classesWithCounts);
          } else {
             setMyClasses([]);
          }
          setLoading(false);
      };

      fetchMyClasses();
  }, [user?.id, user?.schoolId]);

  const totalStudents = myClasses.reduce((acc, curr) => acc + (curr.student_count || 0), 0);

  return (
    <div className="container mx-auto animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">Espace Professeur</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">Bienvenue, {user?.name}.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <DashboardCard title="Classes Assignées" value={myClasses.length} icon={<i className="fas fa-chalkboard"></i>} color="bg-gradient-to-br from-blue-400 to-blue-600" />
            <DashboardCard title="Total Élèves" value={totalStudents} icon={<i className="fas fa-users"></i>} color="bg-gradient-to-br from-green-400 to-green-600" />
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Mes Classes</h2>
            {loading ? <p>Chargement...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myClasses.length > 0 ? myClasses.map(cls => (
                            <div key={cls.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{cls.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{cls.level}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-brand-primary dark:text-blue-400">{cls.student_count}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">élèves</p>
                            </div>
                        </div>
                    )) : <p className="text-slate-500">Aucune classe assignée pour le moment.</p>}
                </div>
            )}
        </div>
    </div>
  );
};

export default TeacherDashboard;
