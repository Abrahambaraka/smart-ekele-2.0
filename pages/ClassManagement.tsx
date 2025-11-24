
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ClassLevel } from '../types';
import { useNavigate } from 'react-router-dom';

interface ClassData {
    id: string;
    name: string;
    level: ClassLevel;
    teacher_id: string | null;
    student_count?: number;
    school_id: string;
}

const ClassManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState<ClassLevel>(ClassLevel.SIXIEME);

  const fetchClasses = async () => {
      if (!user?.schoolId) return;
      
      try {
          setLoading(true);
          // Récupérer les classes de l'école
          const q = query(collection(db, "classes"), where("school_id", "==", user.schoolId));
          const querySnapshot = await getDocs(q);
          
          const fetchedClasses: any[] = [];
          
          querySnapshot.forEach((doc) => {
             fetchedClasses.push({ id: doc.id, ...doc.data() });
          });
          
          // Trier localement (Firestore requires index for orderBy with where clause sometimes)
          fetchedClasses.sort((a, b) => a.name.localeCompare(b.name));

          // Pour chaque classe, on compte les élèves
          // Note: C'est coûteux en lecture sur Firestore. Pour optimiser, il faudrait un compteur dans le doc classe.
          // Ici, on fait une requête simple pour respecter la logique précédente.
          const classesWithCounts = await Promise.all(fetchedClasses.map(async (cls) => {
              const qStudents = query(collection(db, "students"), where("class_id", "==", cls.id));
              const snap = await getDocs(qStudents);
              return { ...cls, student_count: snap.size };
          }));

          setClasses(classesWithCounts);
      } catch (error) {
          console.error('Erreur chargement classes:', error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchClasses();
  }, [user?.schoolId]);

  const handleAddClass = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.schoolId) return;

      try {
          await addDoc(collection(db, "classes"), {
              name: newClassName,
              level: newClassLevel,
              school_id: user.schoolId,
              created_at: new Date().toISOString()
          });

          setIsModalOpen(false);
          setNewClassName('');
          fetchClasses(); // Rafraîchir la liste
      } catch (error: any) {
          alert('Erreur lors de la création: ' + error.message);
      }
  };

  const handleDeleteClass = async (id: string) => {
      if (!window.confirm('Êtes-vous sûr ? Cela supprimera la classe. Assurez-vous qu\'elle est vide.')) return;

      try {
          await deleteDoc(doc(db, "classes", id));
          setClasses(classes.filter(c => c.id !== id));
      } catch (error: any) {
          alert('Erreur suppression: ' + error.message);
      }
  };

  return (
    <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Gestion des Classes</h1>
        
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg md:text-xl font-semibold">Liste des Classes</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-primary text-white font-semibold px-3 py-2 md:px-4 rounded-md shadow-md hover:bg-brand-secondary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-px flex items-center"
                >
                    <i className="fas fa-plus sm:mr-2"></i><span className="hidden sm:inline">Ajouter une Classe</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center p-4">Chargement...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-style text-sm">
                        <thead>
                            <tr>
                                <th className="p-3 font-semibold">Nom</th>
                                <th className="p-3 font-semibold">Niveau</th>
                                <th className="p-3 font-semibold">Nb. Étudiants</th>
                                <th className="p-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.length > 0 ? classes.map(cls => (
                                <tr key={cls.id} className="border-b dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium">
                                        <button 
                                            onClick={() => navigate('/student-management', { state: { classId: cls.id } })}
                                            className="text-brand-primary hover:underline font-medium focus:outline-none text-left"
                                        >
                                            {cls.name}
                                        </button>
                                    </td>
                                    <td className="p-3">{cls.level}</td>
                                    <td className="p-3">{cls.student_count}</td>
                                    <td className="p-3 space-x-2">
                                        <button onClick={() => handleDeleteClass(cls.id)} className="text-danger-500 hover:text-red-700 transition-colors"><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-4 text-center text-slate-500">Aucune classe trouvée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* Modal Ajout */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4">Nouvelle Classe</h3>
                    <form onSubmit={handleAddClass}>
                        <div className="mb-4">
                            <label className="block text-sm mb-1">Nom de la classe</label>
                            <input 
                                type="text" 
                                value={newClassName}
                                onChange={e => setNewClassName(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm mb-1">Niveau</label>
                            <select 
                                value={newClassLevel}
                                onChange={e => setNewClassLevel(e.target.value as ClassLevel)}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                            >
                                {Object.values(ClassLevel).map(lvl => (
                                    <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded">Annuler</button>
                            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded">Créer</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default ClassManagement;
