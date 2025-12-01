
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ClassLevel } from '../types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

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
  const toast = useToast();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState<ClassLevel>(ClassLevel.PRIMAIRE_1ERE);

  useEffect(() => {
      if (!user?.schoolId) return;
      setLoading(true);
      const qClasses = query(collection(db, 'classes'), where('school_id', '==', user.schoolId));
      const unsubscribe = onSnapshot(qClasses, async (querySnapshot) => {
          try {
              const fetchedClasses = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
              fetchedClasses.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
              const withCounts = await Promise.all(
                  fetchedClasses.map(async (cls) => {
                      const qStudents = query(collection(db, 'students'), where('class_id', '==', cls.id));
                      const snap = await getDocs(qStudents);
                      return { ...cls, student_count: snap.size };
                  })
              );
              setClasses(withCounts as ClassData[]);
          } catch (e: any) {
              console.error('Erreur chargement classes:', e);
              toast.error(`Erreur Firestore (classes): ${e?.code || ''} ${e?.message || e}`);
          } finally {
              setLoading(false);
          }
      }, (err) => {
          console.error('Snapshot classes error:', err);
          toast.error(`Erreur Firestore (classes): ${err?.code || ''} ${err?.message || err}`);
          setLoading(false);
      });
      return () => unsubscribe();
  }, [user?.schoolId]);

  const handleAddClass = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.schoolId) { toast.warning('Votre profil n’est pas lié à une école.'); return; }

      try {
          await addDoc(collection(db, "classes"), {
              name: newClassName,
              level: newClassLevel,
              school_id: user.schoolId,
              created_at: new Date().toISOString()
          });

          setIsModalOpen(false);
          setNewClassName('');
          toast.success('Classe créée avec succès.');
      } catch (error: any) {
          console.error(error);
          toast.error(`Erreur création classe: ${error?.code || ''} ${error?.message || error}`);
      }
  };

  const handleDeleteClass = async (id: string) => {
      if (!window.confirm('Êtes-vous sûr ? Cela supprimera la classe. Assurez-vous qu\'elle est vide.')) return;

      try {
          await deleteDoc(doc(db, "classes", id));
          // La liste sera mise à jour par onSnapshot
          toast.success('Classe supprimée.');
      } catch (error: any) {
          console.error(error);
          toast.error(`Erreur suppression: ${error?.code || ''} ${error?.message || error}`);
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
                                <optgroup label="Cycle Primaire">
                                    <option value={ClassLevel.PRIMAIRE_1ERE}>1ère</option>
                                    <option value={ClassLevel.PRIMAIRE_2EME}>2ème</option>
                                    <option value={ClassLevel.PRIMAIRE_3EME}>3ème</option>
                                    <option value={ClassLevel.PRIMAIRE_4EME}>4ème</option>
                                    <option value={ClassLevel.PRIMAIRE_5EME}>5ème</option>
                                    <option value={ClassLevel.PRIMAIRE_6EME}>6ème</option>
                                </optgroup>
                                <optgroup label="Cycle Secondaire">
                                    <option value={ClassLevel.SECONDAIRE_7EB}>7ème EB</option>
                                    <option value={ClassLevel.SECONDAIRE_8EB}>8ème EB</option>
                                    <option value={ClassLevel.SECONDAIRE_1}>1ère</option>
                                    <option value={ClassLevel.SECONDAIRE_2}>2ème</option>
                                    <option value={ClassLevel.SECONDAIRE_3}>3ème</option>
                                    <option value={ClassLevel.SECONDAIRE_4}>4ème</option>
                                </optgroup>
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
