
import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { StudentStatus } from '../types';
import { useLocation } from 'react-router-dom';
import { studentSchema, type StudentForm } from '../lib/validation';
import { useToast } from '../contexts/ToastContext';
import StudentModalComponent from '../components/StudentModal';

interface StudentData {
    id: string;
    name: string;
    class_id: string | null;
    status: StudentStatus;
    enrollment_date: string;
    phone_number: string;
    parent_phone_number: string;
    parent_address: string;
    school_id: string;
    classes?: { name: string }; // Joined data (manually)
}

interface ClassOption {
    id: string;
    name: string;
}

const StudentManagement: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [students, setStudents] = useState<StudentData[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);

    // Filter and Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState(location.state?.classId ? String(location.state.classId) : 'all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [newStudentName, setNewStudentName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string | ''>('');
    const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStatus, setSelectedStatus] = useState<StudentStatus>(StudentStatus.ACTIVE);
    const [studentPhoneNumber, setStudentPhoneNumber] = useState('');
    const [parentPhoneNumber, setParentPhoneNumber] = useState('');
    const [parentAddress, setParentAddress] = useState('');
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof StudentForm, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFilterClass(location.state?.classId ? String(location.state.classId) : 'all');
    }, [location.state]);

    // Chargement des données initiales (Classes + Etudiants)
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.schoolId) return;
            setLoading(true);

            // 1. Charger les classes
            const qClasses = query(collection(db, "classes"), where("school_id", "==", user.schoolId));
            const classesSnap = await getDocs(qClasses);
            const loadedClasses = classesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setClasses(loadedClasses);

            fetchStudents(loadedClasses);
        };
        fetchData();
    }, [user?.schoolId]); // On re-fetch seulement si l'école change, le reste est géré par fetchStudents ou local

    const fetchStudents = async (loadedClasses: ClassOption[] = classes) => {
        if (!user?.schoolId) return;
        
        const qStudents = query(collection(db, "students"), where("school_id", "==", user.schoolId));
        const snap = await getDocs(qStudents);
        
        let loadedStudents = snap.docs.map(doc => {
            const data = doc.data();
            // Manual join for class name
            const studentClass = loadedClasses.find(c => c.id === data.class_id);
            return {
                id: doc.id,
                ...data,
                classes: studentClass ? { name: studentClass.name } : { name: 'Sans classe' }
            } as StudentData;
        });

        // Filtrage côté client car Firestore a des limitations sur les filtres multiples sans index complexes
        if (filterClass !== 'all') {
            loadedStudents = loadedStudents.filter(s => s.class_id === filterClass);
        }
        if (filterStatus !== 'all') {
            loadedStudents = loadedStudents.filter(s => s.status === filterStatus);
        }
        if (searchTerm) {
            loadedStudents = loadedStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Tri par date
        loadedStudents.sort((a, b) => new Date(b.enrollment_date).getTime() - new Date(a.enrollment_date).getTime());

        setStudents(loadedStudents);
        setLoading(false);
    };

    // Refetch/Refilter quand les filtres changent
    useEffect(() => {
        if (user?.schoolId) fetchStudents();
    }, [filterClass, filterStatus, searchTerm]);


    useEffect(() => {
        if (editingStudent) {
            setNewStudentName(editingStudent.name);
            setSelectedClassId(editingStudent.class_id || '');
            setEnrollmentDate(editingStudent.enrollment_date);
            setSelectedStatus(editingStudent.status);
            setStudentPhoneNumber(editingStudent.phone_number || '');
            setParentPhoneNumber(editingStudent.parent_phone_number || '');
            setParentAddress(editingStudent.parent_address || '');
        } else {
            resetForm();
        }
    }, [editingStudent]);


    const getStatusColor = (status: StudentStatus) => {
        switch (status) {
            case StudentStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case StudentStatus.INACTIVE: return 'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300';
            case StudentStatus.GRADUATED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case StudentStatus.TRANSFERRED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        }
    }

    const resetForm = () => {
        setNewStudentName('');
        setSelectedClassId(classes[0]?.id || '');
        setEnrollmentDate(new Date().toISOString().split('T')[0]);
        setSelectedStatus(StudentStatus.ACTIVE);
        setStudentPhoneNumber('');
        setParentPhoneNumber('');
        setParentAddress('');
        setEditingStudent(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    }

    const handleEditClick = (student: StudentData) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
            try {
                await deleteDoc(doc(db, "students", studentId));
                setStudents(students.filter(s => s.id !== studentId));
            } catch (error: any) {
                alert("Erreur suppression: " + error.message);
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user?.schoolId) {
            toast.warning('Votre profil n\'est pas lié à une école.');
            return;
        }

        setIsSubmitting(true);
        setFormErrors({});

        // Validation immédiate
        const errors: Partial<Record<keyof StudentForm, string>> = {};
        
        if (!newStudentName.trim()) errors.name = 'Le nom de l\'étudiant est requis';
        if (newStudentName.trim().length < 2) errors.name = 'Le nom doit contenir au moins 2 caractères';
        if (!selectedClassId) errors.class_id = 'Veuillez sélectionner une classe';
        if (!enrollmentDate) errors.enrollment_date = 'La date d\'inscription est requise';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setIsSubmitting(false);
            return;
        }

        const payload: StudentForm & { school_id: string } = {
            name: newStudentName.trim(),
            class_id: selectedClassId.toString(),
            enrollment_date: enrollmentDate,
            status: selectedStatus,
            phone_number: studentPhoneNumber ? studentPhoneNumber.trim() : undefined,
            parent_phone_number: parentPhoneNumber ? parentPhoneNumber.trim() : undefined,
            parent_address: parentAddress ? parentAddress.trim() : undefined,
            school_id: user.schoolId,
        };

        // Validation Zod complète
        const parsed = studentSchema.safeParse(payload);
        if (!parsed.success) {
            const fieldErrors: Partial<Record<keyof StudentForm, string>> = {};
            parsed.error.errors.forEach(err => {
                const path = err.path[0] as keyof StudentForm;
                if (path) fieldErrors[path] = err.message;
            });
            setFormErrors(fieldErrors);
            setIsSubmitting(false);
            return;
        }

        const studentPayload = {
            ...parsed.data,
            class_id: parsed.data.class_id === '' ? null : parsed.data.class_id,
            school_id: user.schoolId,
        };

        try {
            if (editingStudent) {
                const studentRef = doc(db, "students", editingStudent.id);
                await updateDoc(studentRef, studentPayload);
                toast.success('Étudiant modifié avec succès.');
            } else {
                await addDoc(collection(db, "students"), {
                    ...studentPayload,
                    created_at: new Date().toISOString()
                });
                toast.success('Étudiant inscrit avec succès.');
            }
            handleCloseModal();
            fetchStudents();
        } catch (error: any) {
            toast.error(`Erreur: ${error?.message || 'Une erreur est survenue'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Gestion des Étudiants</h1>
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 sm:mb-0">Liste des Étudiants</h2>
                    <button onClick={handleOpenAddModal} className="bg-brand-primary text-white font-semibold px-3 py-2 md:px-4 rounded-md shadow-md hover:bg-brand-secondary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-px w-full sm:w-auto flex items-center justify-center">
                       <i className="fas fa-user-plus sm:mr-2"></i> <span className="hidden sm:inline">Inscrire un Étudiant</span>
                    </button>
                </div>

                {/* Search and Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative md:col-span-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <i className="fas fa-search text-slate-400"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher par nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>

                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="all">Toutes les classes</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="all">Tous les statuts</option>
                        {Object.values(StudentStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    {loading ? <p className="text-center p-4">Chargement...</p> : (
                        <table className="w-full text-left table-style text-sm">
                            <thead>
                                <tr>
                                    <th className="p-3 font-semibold">Nom</th>
                                    <th className="p-3 font-semibold">Classe</th>
                                    <th className="p-3 font-semibold hidden md:table-cell">Téléphone</th>
                                    <th className="p-3 font-semibold hidden lg:table-cell">Numéro Parent</th>
                                    <th className="p-3 font-semibold hidden md:table-cell">Statut</th>
                                    <th className="p-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map(student => (
                                        <tr key={student.id} className="border-b dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                            <td className="p-3 font-medium">{student.name}</td>
                                            <td className="p-3">{student.classes?.name || 'Sans classe'}</td>
                                            <td className="p-3 hidden md:table-cell">{student.phone_number || '-'}</td>
                                            <td className="p-3 hidden lg:table-cell">{student.parent_phone_number || '-'}</td>
                                            <td className="p-3 hidden md:table-cell">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>{student.status}</span>
                                            </td>
                                            <td className="p-3 space-x-2">
                                                <button onClick={() => handleEditClick(student)} className="text-primary-500 hover:text-primary-700 transition-colors">
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button onClick={() => handleDeleteStudent(student.id)} className="text-danger-500 hover:text-red-700 transition-colors">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center p-4 text-slate-500 dark:text-slate-400">
                                            Aucun étudiant trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <StudentModalComponent
                isOpen={isModalOpen}
                isEditing={!!editingStudent}
                isSubmitting={isSubmitting}
                newStudentName={newStudentName}
                selectedClassId={selectedClassId}
                enrollmentDate={enrollmentDate}
                selectedStatus={selectedStatus}
                studentPhoneNumber={studentPhoneNumber}
                parentPhoneNumber={parentPhoneNumber}
                parentAddress={parentAddress}
                formErrors={formErrors}
                classes={classes}
                onNameChange={setNewStudentName}
                onClassChange={setSelectedClassId}
                onEnrollmentDateChange={setEnrollmentDate}
                onStatusChange={setSelectedStatus}
                onStudentPhoneChange={setStudentPhoneNumber}
                onParentPhoneChange={setParentPhoneNumber}
                onParentAddressChange={setParentAddress}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default StudentManagement;
